import json
import random
from urllib.request import urlopen
from sqlitedict import SqliteDict
from abuse_control import abuse_detected, TOO_MANY_REQUESTS

API_KEY = '0f77edb2b53cbab1b812a1d3f9469a30'
cache = SqliteDict('./cached/cache.sqlite', autocommit=True)

def musicfm_request(ip, method, artist="", mbid="", limit=""):
    url = f'https://ws.audioscrobbler.com/2.0/?method={method}&api_key={API_KEY}&format=json'
    if artist:
        url += f'&artist={artist}'
    if mbid:
        url += f'&mbid={mbid}'
    if limit:
        url += f'&limit={limit}'
    if url in cache:
        print("cached musicfm")
        json_data:dict = cache[url]
        return cache[url]

    if abuse_detected(ip):
        return {'error': TOO_MANY_REQUESTS}

    print("FIRST TIME MUSICFM!")
    with urlopen(url) as response:
        json_data:dict = json.load(response)
        cache[url] = json_data
        return json_data

def get_similar_artists(artist, ip):
    data = musicfm_request(ip, 'artist.gettoptracks', artist=artist, limit=3)
    if 'error' in data:
        if data['error'] == 6:
            return {'error': 'ARTIST_NOT_FOUND'}
        return data
    requested_artist_song = random.choice(data['toptracks']['track'])
    songs = []
    data = musicfm_request(ip, 'artist.getsimilar', artist=artist, limit=40)
    for artist in data['similarartists']['artist']:
        if 'mbid' in artist:
            tracks_data = musicfm_request(ip, 'artist.gettoptracks', mbid=artist['mbid'], limit=3)
            song = random.choice(tracks_data['toptracks']['track'])
            songs.append(song)
    # One song of the requested artist at the end, as a treat (only one to play fully)
    songs.append(requested_artist_song)
    for song in songs:
        song.pop('image', None)
        song.pop('@attr', None)
    return songs
