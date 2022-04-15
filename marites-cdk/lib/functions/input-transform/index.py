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

    return frames

def upsert_frames_to_tigergraph(users, following, posts):
    # Create tigergraph connection
    conn = tg.TigerGraphConnection(host=tg_host, graphname=tg_graph, password=tg_password)
    secret = conn.createSecret()
    conn.getToken(secret=secret)

    user_vertices = conn.upsertVertexDataFrame(
        df=users,
        vertexType='user',
        v_id='username',
        attributes={
            'name': 'name',
            'username': 'username'
        }
    )

    post_vertices = conn.upsertVertexDataFrame(
        df=posts,
        vertexType='post',
        v_id='line_id'
    )

    following_edges = conn.upsertEdgeDataFrame(
        df=following,
        sourceVertexType='user',
        edgeType='following',
        targetVertexType='user',
        from_id='user',
        to_id='following',
        attributes={ 'connect_day': 'date' }
    )

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

    try:
        input_frames = get_frames_from_s3(bucket, key)
        following = input_frames['following']
        users = input_frames['users']
        posts = input_frames['posts']

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
