from flask import Flask, jsonify, request
import json
import os
from analysis.categorize import categorize_post
from analysis.severity import calculate_severity

app = Flask(__name__)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# File paths
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
RAW_DATA_FILE = os.path.join(DATA_DIR, 'reddit_problems_full.json')
PROCESSED_DATA_FILE = os.path.join(DATA_DIR, 'reddit_processed.json')

def load_raw_data():
    """Load raw Reddit data from JSON file."""
    try:
        with open(RAW_DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: {RAW_DATA_FILE} not found")
        return []
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {RAW_DATA_FILE}")
        return []

def process_data():
    """Process raw data and save processed data."""
    raw_data = load_raw_data()
    processed_data = []

    for post in raw_data:
        # Extract post content
        title = post.get('title', '')
        body = post.get('body', '')
        score = post.get('score', 0)
        num_comments = post.get('num_comments', 0)
        top_comments = post.get('top_comments', [])

        # Categorize post
        category = categorize_post(title, body)

        # Calculate severity
        severity_score, severity_level = calculate_severity(score, num_comments, top_comments)

        # Create processed post object
        processed_post = {
            'post_id': post.get('post_id'),
            'title': title,
            'body': body,
            'category': category,
            'severity_score': severity_score,
            'severity_level': severity_level,
            'score': score,
            'num_comments': num_comments,
            'created_utc': post.get('created_utc'),
            'top_comments': top_comments
        }

        processed_data.append(processed_post)

    # Save processed data
    with open(PROCESSED_DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(processed_data, f, indent=2, ensure_ascii=False)

    return processed_data

def load_processed_data():
    """Load processed data, process if not exists."""
    if not os.path.exists(PROCESSED_DATA_FILE):
        return process_data()

    try:
        with open(PROCESSED_DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return process_data()

# Load data on startup
processed_data = load_processed_data()

@app.route('/api/posts', methods=['GET'])
def get_posts():
    """Return all processed posts."""
    return jsonify(processed_data)

@app.route('/api/high-severity', methods=['GET'])
def get_high_severity():
    """Return posts with high severity."""
    high_severity_posts = [post for post in processed_data if post['severity_level'] == 'High']
    return jsonify(high_severity_posts)

@app.route('/api/summary', methods=['GET'])
def get_summary():
    """Return summary statistics."""
    total_posts = len(processed_data)
    severity_counts = {
        'high': len([p for p in processed_data if p['severity_level'] == 'High']),
        'medium': len([p for p in processed_data if p['severity_level'] == 'Medium']),
        'low': len([p for p in processed_data if p['severity_level'] == 'Low'])
    }

    summary = {
        'total_posts': total_posts,
        'high': severity_counts['high'],
        'medium': severity_counts['medium'],
        'low': severity_counts['low']
    }

    return jsonify(summary)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
