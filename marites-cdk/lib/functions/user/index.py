import os
import json
import pyTigerGraph as tg
from dotenv import load_dotenv
import pandas as pd
import requests

load_dotenv()
print('Loading Function...')

tg_graph = 'marites'
tg_host = os.environ.get('TG_HOST').strip('/')
tg_secret = os.environ.get('TG_SECRET')
tg_password = os.environ.get('TG_PASSWORD')

pronouns = [
    'i',
    'we',
    'you',
    'he',
    'she',
    'it',
    'they',
    'me',
    'us',
    'him',
    'her',
    'them',
    'ours',
    'yours',
    'his',
    'hers',
    'ours',
    'its',
    'their',
    'these',
    'your',
    'of',
    'the',
    'theirs',
    'myself',
    'yourself',
    'himself',
    'herself',
    'ourselves',
    'itself',
    'themselves',
    'each other',
    'one another',
    'that',
    'which',
    'who',
    'whom',
    'whose',
    'where',
    'when',
    'what',
    'whatever',
    'anything',
    'anybody',
    'anyone',
    'something',
    'somebody',
    'nothing',
    'nobody',
    'none',
    'no one'
]

def clean_topic_data(topic_df):
    # Remove all symbols
    topic_df.text = topic_df.text.str.replace('[^0-9a-zA-Z]', '')

    # Convert everything to lowercase
    topic_df.text = topic_df.text.str.lower()

    # Remove pronouns
    topic_df = topic_df[~topic_df.text.isin(pronouns)]

    # Remove numbers
    topic_df = topic_df[~topic_df.text.str.contains(r'\d')]

    # Remove blank strings
    topic_df = topic_df[topic_df.text.str.strip().str.len() != 0]

    return list(topic_df.text)

def get_user_following(username, token):
    url = f'{tg_host}:9000/query/{tg_graph}/get_following?p={username}'
    resp = requests.get(url, headers={ 'Authorization': f'Bearer {token}' }).json()
    if resp['error']:
        return None
    else:
        results = resp['results']
        following = list(map(lambda x: x['attributes'], results[0]['tgt']))
        return following

def get_user_topics(username, token):
    url = f'{tg_host}:9000/query/{tg_graph}/get_user_topics?u={username}'
    resp = requests.get(url, headers={ 'Authorization': f'Bearer {token}' }).json()
    if resp['error']:
        return []
    else:
        results = resp['results']
        topics = list(map(lambda x: x['attributes'], results[0]['all_topics']))
        topic_df = pd.DataFrame(topics)
        return clean_topic_data(topic_df)

def handler(event, context):
    path_params = event['pathParameters']
    username = path_params['id']
    token = tg.TigerGraphConnection(host=tg_host, graphname=tg_graph).getToken(tg_secret)[0]

    followings = get_user_following(username, token)

    if followings is None:
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'data': 'User not found.'
            }),
            'isBase64Encoded': False
        }

    topics = get_user_topics(username, token)

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'data': {
                'following': followings,
                'interests': topics
            }
        }),
        'isBase64Encoded': False
    }
