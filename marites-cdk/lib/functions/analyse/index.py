import os
import re
import json
import boto3
import tarfile
import requests
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
from io import StringIO, BytesIO
from tempfile import TemporaryDirectory

print("Loading Function")

load_dotenv()

# Comprehend constants
language_code = 'en'
input_doc_format = 'ONE_DOC_PER_LINE'
region = os.environ.get('AWS_REGION')
input_bucket = os.environ.get('INPUT_BUCKET')
output_bucket = os.environ.get('OUTPUT_BUCKET')
data_access_role_arn = os.environ.get("DATA_ACCESS_ROLE")

# S3 bucket configuration
tg_input_folder = 'tigergraph'
comprehend_input_folder = 'comprehend'

# Twitter API constants
max_following = 250
max_twitter_posts = 100
token = os.environ.get('BEARER_TOKEN')
search_url = 'https://api.twitter.com/2/tweets/search/recent'
following_url = 'https://api.twitter.com/2/users/{}/following'
lookup_username_url = 'https://api.twitter.com/2/users/by/username/{}'

# Twitter Functions
def bearer_oauth(r):
    """
    Method required by bearer token authentication.
    """
    r.headers['Authorization'] = f"Bearer {token}"
    return r

def fetch_user_by_username(username):
    url = lookup_username_url.format(username)
    response = requests.get(url, auth=bearer_oauth)
    if response.status_code != 200:
        raise Exception(response.status_code, response.text)
    json_res = response.json()
    return json_res['data']

def map_tweets_to_post(raw_data):
    if 'data' not in raw_data:
        return []

    tweets = raw_data['data']
    username = raw_data['includes']['users'][0]['username']
    ref_tweets = { tweet['id']: tweet['text'] for tweet in raw_data['includes']['tweets'] } if 'includes' in raw_data and 'tweets' in raw_data['includes'] else {}

    results = []
    for t in tweets:
        post = {
            'tweet_id': t['id'],
            'username': username,
            'created_at': t['created_at']
        }
        if 'referenced_tweets' in t:
            combined_text = []
            for rt in t['referenced_tweets']:
                rt_id = rt['id']
                if rt_id in ref_tweets:
                    rt_text = ref_tweets[rt_id]
                    combined_text.append(rt_text)
            post['text'] = ' '.join(combined_text)
        else:
            post['text'] = t['text']

        results.append(post)

    return results

def fetch_tweets_by_username(username):
    params = {
        "query": "from:{} -is:reply".format(username),
        "max_results": max_twitter_posts,
        "expansions": "referenced_tweets.id,author_id",
        "tweet.fields": "created_at",
        "user.fields": "username"
    }
    response = requests.get(search_url, auth=bearer_oauth, params=params)
    if response.status_code != 200:
        raise Exception(response.status_code, response.text)
    data = response.json()
    return map_tweets_to_post(data)


def fetch_following(user_id):
    url = following_url.format(user_id)
    params = {
        'max_results': max_following
    }
    response = requests.get(url, auth=bearer_oauth, params=params)
    if response.status_code != 200:
        raise Exception(response.status_code, response.text)
    json_res = response.json()
    return json_res['data']

# Twitter data extraction

def get_user_tweets(users_to_search):
    processed = 0
    all_tweets = []
    for user in users_to_search:
        user_tweets = fetch_tweets_by_username(user)
        processed += 1
        all_tweets.extend(user_tweets)
        progress = round((processed / len(users_to_search)) * 100, 2)
        print("Processed {}/{} users ({}%)".format(processed, len(users_to_search), progress))
    user_tweets = pd.DataFrame(all_tweets)
    return user_tweets

def get_user_following_map(user, following):
    date = datetime.now().strftime("%m-%d-%y")
    username = user['username']
    follow_names = list(map(lambda x: x['username'], following))

    return pd.DataFrame({
        'user': [username] * len(following),
        'following': follow_names,
        'date': [date] * len(following)
    })

def clean_posts(data):
    user_tweets = data

    if user_tweets.empty:
        return []

    # Clean up the links from the text (they're useless to us)
    user_tweets['text'] = user_tweets['text'].apply(lambda x: re.split('https:\/\/.*', str(x))[0])

    # Remove all emojis
    user_tweets = user_tweets.astype(str).apply(lambda x: x.str.encode('ascii', 'ignore').str.decode('ascii'))

    # Remove blank tweets
    user_tweets = user_tweets[user_tweets.text.str.strip().str.len() != 0]

    # Ensure that all text is in a single line
    user_tweets.text = user_tweets.text.str.replace('\n', ' ');
    user_tweets.text = user_tweets.text.str.replace('\r', ' ');

    return user_tweets

def extract_twitter_data(username):
    users_list = []
    user = fetch_user_by_username(username)
    user_following = fetch_following(user['id'])

    users_list.append(user)
    users_list.extend(user_following)

    users_to_search = list(map(lambda x: x['username'], users_list))

    posts_df = get_user_tweets(users_to_search)
    following_df = get_user_following_map(user, user_following) # user -> following edges
    users_df = pd.DataFrame(users_list) # users vertex

    return {
        'posts': clean_posts(posts_df),
        'following': following_df,
        'users': users_df
    }

# Upload to S3 functions

def upload_text_to_s3(data, bucket_name, file_name):
    text_buffer = StringIO()
    data.text.to_csv(text_buffer, sep=' ', index=False, header=False)
    s3_resource = boto3.resource('s3')
    return s3_resource.Object(bucket_name, '{}.txt'.format(file_name)).put(Body=text_buffer.getvalue())

def upload_frames_to_s3(tar_filename, bucket_name, frame_dict):
    tar_buffer = BytesIO()

    # Create a tarfile into which frames can be added
    with tarfile.open(fileobj=tar_buffer, mode='w:gz') as tfo:

        # Loop over all dataframes to be saved
        for file_name, df in frame_dict.items():

            # Compute the full path of the output file within the archive
            archive_name = os.path.join('output', file_name)

            # Create a temporary directory for packaging into a tar_file
            with TemporaryDirectory(prefix='rev_processing__') as temp_dir:

                # Write a csv dump of the dataframe to a temporary file
                temp_file_name = os.path.join(temp_dir, archive_name)
                os.makedirs(os.path.dirname(temp_file_name), exist_ok=True)
                df.to_csv(temp_file_name, index=False)

                # Add the temp file to the tarfile
                tfo.add(temp_file_name, arcname=archive_name)

    # Upload to S3
    s3_resource = boto3.resource('s3')
    return s3_resource.Object(bucket_name, f'{tar_filename}.tar.gz').put(Body=tar_buffer.getvalue())

# Comprehend analysis

def start_targeted_sentiment_job(input_s3_url, output_s3_url, job_tag):
    input_data_config = {
        'S3Uri': input_s3_url,
        'InputFormat': input_doc_format
    }

    output_data_config = {
        'S3Uri': output_s3_url
    }

    job_name = 'Targeted_Sentiment_Job_{}'.format(job_tag)

    comprehend = boto3.client('comprehend', region_name=region)
    return comprehend.start_targeted_sentiment_detection_job(InputDataConfig=input_data_config,
                                                             OutputDataConfig=output_data_config,
                                                             DataAccessRoleArn=data_access_role_arn,
                                                             LanguageCode=language_code,
                                                             JobName=job_name)


def analyse_tweets(username, request_id):
    date = datetime.now().strftime("%m-%d-%y")
    tag = "{}-{}".format(date, username)

    twitter_data = extract_twitter_data(username)

    posts = twitter_data['posts']
    posts['line_id'] = posts.index.map(lambda x: '{}-{}'.format(x, tag)) # used for mapping entities

    following = twitter_data['following']
    users = twitter_data['users']

    session_folder = '{}/{}'.format(request_id, username)
    tg_folder = '{}/{}'.format(tg_input_folder, session_folder) # Tigergraph files
    comp_folder = '{}/{}'.format(comprehend_input_folder, session_folder) # Comprehend files

    posts_filename = 'posts'
    following_filename = 'following'
    users_filename = 'users'

    # Upload data to Comprehend input folder
    print("Uploading comprehend input files...")
    upload_text_to_s3(posts, input_bucket, '{}/{}_{}'.format(comp_folder, posts_filename, tag))

    print("Uploading Tigergraph input files...")
    # Upload data to Tigergraph input folder
    uploaded_frames = {
        f'{users_filename}.csv': users,
        f'{following_filename}.csv': following,
        f'{posts_filename}.csv': posts
    }
    upload_frames_to_s3(tg_folder, input_bucket, uploaded_frames)

    print("Starting comprehend job...")
    # Start comprehend job
    input_s3_url = 's3://{}/{}'.format(input_bucket, comp_folder)
    output_s3_url = 's3://{}/{}'.format(output_bucket, session_folder)
    return start_targeted_sentiment_job(input_s3_url, output_s3_url, tag)

def handler(event, context):
    request_id = context.aws_request_id
    print(event)
    body = json.loads(event['body'])

    if 'username' not in body:
        return {
            'statusCode': 400,
            'message': 'Username not found'
        }

    username = body['username']

    try:
        response = analyse_tweets(username, request_id)
        job_id = response['JobId']
        job_status = response['JobStatus']
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'requestId': request_id,
                'jobId': job_id,
                'jobStatus': job_status
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': str(e)
            }),
            'headers': {
                'Content-Type': 'application/json'
            },
            'isBase64Encoded': False
        }
