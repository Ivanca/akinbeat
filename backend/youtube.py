
import json
import os
from googleapiclient.discovery import build
from sqlitedict import SqliteDict
import requests
from cache import get_cache

from abuse_control import abuse_detected, TOO_MANY_REQUESTS


def youtube_search(q, ip):
    cache = get_cache()

    cache_key = 'yt-scraper-query: ' + q
    if cache_key in cache:
        return cache[cache_key]

    if abuse_detected(ip):
        return {'error': TOO_MANY_REQUESTS}
    url = 'http://localhost:8080/api/search'
    data = {'q': q}
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    res = requests.get(url, params=data, headers=headers).json()
    if 'error' in res:
        return res
    video = res['result']
    cache[cache_key] = video
    cache.close()
    return video

def youtube_search_using_api(q, ip):

    # Set DEVELOPER_KEY to the API key value from the APIs & auth > Registered apps
    # tab of
    #   https://cloud.google.com/console
    # Please ensure that you have enabled the YouTube Data API for your project.

    DEVELOPER_KEY = os.environ['YT_DEVELOPER_KEY']
    YOUTUBE_API_SERVICE_NAME = 'youtube'
    YOUTUBE_API_VERSION = 'v3'
    cache = SqliteDict('./cached/cache.sqlite', autocommit=True)

    youtube = build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION, developerKey=DEVELOPER_KEY)
    cache_key = 'youtube-query: ' + q

    # Call the search.list method to retrieve results matching the specified
    # query term.
    if cache_key in cache:
        search_response = cache[cache_key]
    else:
        if abuse_detected(ip):
            return {'error': TOO_MANY_REQUESTS}
        search_response = youtube.search().list(
            q=q,
            part='id',
            type='video',
            maxResults=1
        ).execute()
        cache[cache_key] = search_response
    cache.close()
    return search_response.get('items', [])
