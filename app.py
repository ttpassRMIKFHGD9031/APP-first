# app.py
from flask import Flask, render_template, request, redirect, url_for, jsonify
import json
import os

app = Flask(__name__)

data_file = 'data/artists.json'

# Helper function to load artist data
def load_artists():
    if os.path.exists(data_file):
        with open(data_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

# Helper function to save artist data
def save_artists(artists):
    with open(data_file, 'w', encoding='utf-8') as f:
        json.dump(artists, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/artists', methods=['GET', 'POST'])
def artists():
    artists = load_artists()
    if request.method == 'POST':
        name = request.form.get('name')
        genre = request.form.get('genre')
        if name and genre:
            artists.append({"name": name, "genre": genre})
            save_artists(artists)
            return redirect(url_for('artists'))
    return render_template('artists.html', artists=artists)

@app.route('/api/artists', methods=['GET'])
def get_artists():
    return jsonify(load_artists())

if __name__ == '__main__':
    app.run(debug=True)