from flask import Flask, request, jsonify
from musicfm import get_similar_artists
from youtube import youtube_search
from urllib.parse import quote

app = Flask(__name__)

@app.route('/')
def get_similar_music():
    ip = request.remote_addr
    artist = request.args.get('artist')
    if not artist:
        return jsonify({})

    similar_ones = get_similar_artists(quote(artist), ip)

    if 'error' in similar_ones:
        return jsonify(similar_ones['error'])

    # Youtube APi fucking sucks, let use scrapper instead
    similar_ones = similar_ones[:10]
    videos = []

    for song in similar_ones:
        query = song['artist']['name'] + " - " + song['name']
        yt_result = youtube_search(query, ip)
        if 'error' in yt_result:
            return jsonify(yt_result['error'])
        videos.append(yt_result)

    return jsonify(videos)


    