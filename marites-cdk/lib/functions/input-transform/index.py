import json
import os
import re
import boto3
import tarfile
import pandas as pd
import urllib.parse
from io import BytesIO
import pyTigerGraph as tg
from dotenv import load_dotenv

load_dotenv()

print('Loading function')

s3 = boto3.client('s3')

tg_graph = "marites"
tg_host = os.environ.get("TG_HOST")
tg_password = os.environ.get("TG_PASSWORD")
tg_secret = os.environ.get("TG_SECRET")

def get_frames_from_s3(bucket, s3_key):
    s3 = boto3.client('s3')
    input_tar_file = s3.get_object(Bucket=bucket, Key=s3_key)
    input_tar_content = input_tar_file['Body'].read()

    tar = tarfile.open(fileobj=BytesIO(input_tar_content))

    frames = {}

    for tar_resource in tar:
        filename = tar_resource.name
        key = re.search('(.*)/(.*).csv', filename).group(2)
        df = pd.read_csv(tar.extractfile(tar_resource), header=0)
        frames[key] = df
    
    tar.close()

    return frames

def upsert_frames_to_tigergraph(users, following, posts):
    # Create tigergraph connection
    print('Connecting to Tigergraph...')
    token = tg.TigerGraphConnection(host=tg_host, graphname=tg_graph).getToken(tg_secret)[0]
    conn = tg.TigerGraphConnection(host=tg_host, graphname=tg_graph, password=tg_password, apiToken=token)

    print('Creating user vertices...')
    user_vertices = conn.upsertVertexDataFrame(
        df=users,
        vertexType='user',
        v_id='username',
        attributes={
            'name': 'name',
            'username': 'username'
        }
    )

    print('Creating post vertices...')
    post_vertices = conn.upsertVertexDataFrame(
        df=posts,
        vertexType='post',
        v_id='line_id'
    )

    print('Creating following edges...')
    following_edges = conn.upsertEdgeDataFrame(
        df=following,
        sourceVertexType='user',
        edgeType='following',
        targetVertexType='user',
        from_id='user',
        to_id='following',
        attributes={ 'connect_day': 'date' }
    )

    print('Creating post edges...')
    post_edges = conn.upsertEdgeDataFrame(
        df=posts,
        sourceVertexType='user',
        edgeType='created_post',
        targetVertexType='post',
        from_id='username',
        to_id='line_id',
        attributes={ 'created_at': 'created_at' }
    )

    return {
        'user_vertices': user_vertices,
        'post_vertices': post_vertices,
        'following_edges': following_edges,
        'post_edges': post_edges
    }

def handler(event, context):
    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')

    print(f'Extracting {key} from ${bucket}')

    try:
        input_frames = get_frames_from_s3(bucket, key)
        following = input_frames['following']
        users = input_frames['users']
        posts = input_frames['posts']
        
        print('Extracted input frames: users ({}), following ({}), posts ({})'.format(users.shape[0], following.shape[0], posts.shape[0]))

        resp = upsert_frames_to_tigergraph(users, following, posts)

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps(resp)
        }
    except Exception as e:
        print(e)
        raise e
