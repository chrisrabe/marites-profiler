import os
import json
import urllib.parse
from dotenv import load_dotenv
from newsapi import NewsApiClient
from newscatcherapi import NewsCatcherApiClient

load_dotenv()

news_api_key = os.environ.get("NEWS_API_KEY")
news_catcher_api_key = os.environ.get("NEWS_CATCHER_API_KEY")

newsapi = NewsApiClient(api_key=news_api_key)
newscatcherapi = NewsCatcherApiClient(x_api_key=news_catcher_api_key)

valid_image_formats = ['.jpg', '.png', '.jpeg']

def map_to_standardised_format_news_api(article):
    return {
        'title': article['title'],
        'image': article['urlToImage'],
        'description': article['description'],
        'url': article['url'],
        'publishDate': article['publishedAt']
    }

def map_to_standardised_format_newscatcher(article):
    return {
        'title': article['title'],
        'image': article['media'],
        'description': article['summary'],
        'url': article['link'],
        'publishDate': article['published_date']
    }

def get_articles_by_country(country_code):
    results = []
    newsapi_articles = newsapi.get_top_headlines(country=country_code.lower(), page_size=100)['articles']
    newscatcher_articles = newscatcherapi.get_latest_headlines(countries=country_code, lang='en', page_size=100)['articles']
    results.extend(list(map(map_to_standardised_format_news_api, newsapi_articles)))
    results.extend(list(map(map_to_standardised_format_newscatcher, newscatcher_articles)))
    return results

def get_articles_by_query(query, country_code):
    results = []
    newsapi_articles = newsapi.get_everything(language='en', q=query)['articles']
    newscatcher_articles = newscatcherapi.get_search(q=query, countries=country_code, lang='en', page_size=100)['articles']
    results.extend(list(map(map_to_standardised_format_news_api, newsapi_articles)))
    results.extend(list(map(map_to_standardised_format_newscatcher, newscatcher_articles)))
    return results

def get_news_query(params):
    if 'keywords' not in params:
        return None
    else:
        keywords = urllib.parse.unquote_plus(params['keywords'], encoding='utf-8')
        return ' OR '.join(keywords.split(','))

def get_articles(country_code, query):
    if query is None:
        return get_articles_by_country(country_code)
    else:
        return get_articles_by_query(query, country_code)

def handler(event, context):
    params = event['queryStringParameters']
    country_code = params['countryCode'] if 'countryCode' in params else 'AU'
    query = get_news_query(params)

    try:
        articles = get_articles(country_code, query)
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps(articles),
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
