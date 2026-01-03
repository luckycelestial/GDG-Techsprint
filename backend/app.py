from flask import Flask, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

@app.route('/api/reddit/<subreddit>', methods=['GET'])
def fetch_reddit(subreddit):
    """Fetch posts from Reddit subreddit."""
    try:
        url = f'https://www.reddit.com/r/{subreddit}/hot.json?limit=100'
        headers = {
            'User-Agent': 'CollegeProblemTracker/1.0'
        }
        
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch from Reddit'}), 500
        
        data = response.json()
        return jsonify(data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
