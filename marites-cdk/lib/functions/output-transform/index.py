import os
import re
import json
import tarfile
import boto3
import pandas as pd
import urllib.parse
import pyTigerGraph as tg
from dotenv import load_dotenv
from io import BytesIO, TextIOWrapper

load_dotenv()

print('Loading function')

tg_graph = "marites"
tg_host = os.environ.get("TG_HOST")
tg_password = os.environ.get("TG_PASSWORD")
tg_secret = os.environ.get("TG_SECRET")

def map_result(data):
    json_data = json.loads(data)
    filename = json_data['File']
    line_num = json_data['Line'] + 1
    tag = re.search('(.*)_(.*).txt', filename).group(2)
    
    line_id = '{}-{}'.format(line_num, tag)
    
    results = []
    
    for entity in json_data['Entities']:
        for mention in entity['Mentions']:
            sentiment_data = mention['MentionSentiment']
            sentiment_scores = sentiment_data['SentimentScore']
            
            topic = {
                'line_id': line_id,
                'text': mention['Text'],
                'type': mention['Type'],
                'sentiment': sentiment_data['Sentiment'],
                'positive_score': sentiment_scores['Positive'],
                'negative_score': sentiment_scores['Negative'],
                'neutral_score': sentiment_scores['Neutral'],
                'mixed_score': sentiment_scores['Mixed']
            }

            results.append(topic)

    return results

def get_topics_from_s3(bucket, s3_key):
    s3 = boto3.client('s3')
    input_tar_file = s3.get_object(Bucket=bucket, Key=s3_key)
    input_tar_content = input_tar_file['Body'].read()
    entities = []
    with tarfile.open(fileobj=BytesIO(input_tar_content)) as tar:
        for tar_resource in tar:
            file = TextIOWrapper(tar.extractfile(tar_resource), encoding='utf-8')
            lines = file.readlines()
            for line in lines:
                results = map_result(line)
                entities.extend(results)
    return pd.DataFrame(entities)

def upload_topics_to_tg(topics):
    print('Connecting to Tigergraph...')
    token = tg.TigerGraphConnection(host=tg_host, graphname=tg_graph).getToken(tg_secret)[0]
    conn = tg.TigerGraphConnection(host=tg_host, graphname=tg_graph, password=tg_password, apiToken=token)

    print("Creating topic vertex...")
    topic_vertices = conn.upsertVertexDataFrame(
        df=topics,
        vertexType='topic',
        v_id='text',
        attributes={ 'text': 'text', 'topic_type': 'type' }
    )

    print(f'Done. Upserted {topic_vertices} topic vertices')

    print('Creating topic edges...')

    topic_edges = conn.upsertEdgeDataFrame(
        df=topics,
        sourceVertexType='post',
        edgeType='topic_sentiment',
        targetVertexType='topic',
        from_id='line_id',
        to_id='text',
        attributes={
            'topic': 'text',
            'sentiment': 'sentiment',
            'topic_type': 'type'
        }
    )

    print(f'Done. Upserted {topic_edges} topic edges')

    return {
        'topic_vertices': topic_vertices,
        'topic_edges': topic_edges
    }


def handler(event, context):
    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')

    try:
        topics = get_topics_from_s3(bucket, key)
        resp = upload_topics_to_tg(topics)
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
