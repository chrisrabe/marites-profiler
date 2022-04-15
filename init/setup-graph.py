import pyTigerGraph as tg
from dotenv import load_dotenv
import os

tg_graph = "marites"
tg_host = os.environ.get("TG_HOST")
tg_password = os.environ.get("TG_PASSWORD")

conn = tg.TigerGraphConnection(host=tg_host, graphname=tg_graph, password=tg_password)

# If uncommend you want to rebuild everything
# print(conn.gsql('use global drop all'))

print(conn.gsql('''
use global

create vertex user (primary_id username string, name string, username string)

create vertex post (
    primary_id line_id string,
    line_id string,
    tweet_id int,
    username string,
    text string,
    created_at datetime
)

create vertex topic (
    primary_id text string,
    text string,
    type string
)

create directed edge following (from user, to user, connect_day string)
create undirected edge created_post (from user, to post, created_at datetime)
create undirected edge topic_sentiment (
    from post,
    to topic,
    topic string,
    sentiment string,
    positive_score double,
    negative_score double,
    neutral_score double,
    mixed_score double
)

create graph marites(user, post, topic, following, created_post, topic_sentiment)
'''))
