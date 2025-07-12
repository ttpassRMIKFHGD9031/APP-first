# app.py
from flask import Flask, render_template, jsonify
import json
import os

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")  # ホーム画面

@app.route("/calendar")
def calendar():
    # JSONファイルからイベントを読み込む
    data_path = os.path.join(app.root_path, 'data', 'artists.json')
    with open(data_path, 'r', encoding='utf-8') as f:
        events = json.load(f)
    return render_template("calendar.html", events=events)

# 静的ファイルは static/ に置いてある必要があります
# テンプレートは templates/ に置いてある必要があります

if __name__ == '__main__':
    app.run(debug=True)
