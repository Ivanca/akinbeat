from flask import Flask, request, jsonify
from musicfm import get_similar_artists
from youtube import youtube_search
from urllib.parse import quote
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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
    similar_ones = similar_ones[:20]
    videos = []
    songs_not_found = 0

    for song in similar_ones:
        query = song['artist']['name'] + " - " + song['name']
        yt_result = youtube_search(query, ip)
        if 'error' in yt_result:
            if yt_result['error'] == 'song not found' and songs_not_found < 5:
                # some songs cannot be found, just skip this one (max 5 skips)
                songs_not_found += 1
                continue
            return jsonify(yt_result['error'])
        # Dont use actual youtube title, is full of noise (e.g "[ Official video ]")
        yt_result['title'] = song['name']
        yt_result['artist'] = song['artist']['name']
        videos.append(yt_result)

    return jsonify(videos)
