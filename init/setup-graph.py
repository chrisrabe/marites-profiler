import pyTigerGraph as tg
from dotenv import load_dotenv
import os

load_dotenv()

tg_graph = "marites"
tg_host = os.environ.get("TG_HOST")
tg_password = os.environ.get("TG_PASSWORD")

print(f"Connecting to TigerGraph: {tg_host}")
conn = tg.TigerGraphConnection(host=tg_host, graphname=tg_graph, password=tg_password)

# Uncomment if you want to rebuild everything
print("Dropping current data..")
print(conn.gsql('use global drop all'))

# Create entire graph
print("Creating the Marites schema...")
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
    topic_type string
)

create directed edge following (from user, to user, connect_day string)
create directed edge created_post (from user, to post, created_at datetime)
create directed edge topic_sentiment (
    from post,
    to topic,
    topic string,
    sentiment string,
    topic_type string
)

create graph marites(user, post, topic, following, created_post, topic_sentiment)
'''))

# Create and install queries
print("Creating queries...")
print(conn.gsql('''
use graph marites

drop query get_following

create query get_following(vertex<user> p) for graph marites {
    start = {p};
    tgt = select t from start:s-(following:e)-user:t;
    print tgt;
}

install query get_following
'''))

# Generate secret
print("Generating secret...")
secret = conn.createSecret()
print(f'Your secret: {secret}')