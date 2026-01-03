from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')

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

@app.route('/api/categorize', methods=['POST'])
def categorize_posts():
    """Categorize posts using Perplexity AI."""
    try:
        data = request.json
        posts = data.get('posts', [])
        
        categories = [
            'Academic Stress',
            'Social & Relationships',
            'Financial Struggles',
            'Mental Health',
            'Career Anxiety',
            'Living Situations',
            'Other'
        ]
        
        categorized_posts = []
        
        for post in posts:
            try:
                response = requests.post('https://api.perplexity.ai/chat/completions', {
                    'model': 'llama-3.1-sonar-small-128k-online',
                    'messages': [{
                        'role': 'user',
                        'content': f"Categorize this college student problem into exactly one of these categories: {', '.join(categories)}. Respond with only the category name.\n\nProblem: {post['title']}\n\n{post['content']}"
                    }],
                    'max_tokens': 20,
                    'temperature': 0.1
                }, headers={
                    'Authorization': f'Bearer {PERPLEXITY_API_KEY}',
                    'Content-Type': 'application/json'
                })
                
                if response.status_code == 200:
                    result = response.json()
                    category = result['choices'][0]['message']['content'].strip()
                    categorized_posts.append({
                        **post,
                        'category': category if category in categories else 'Other'
                    })
                else:
                    categorized_posts.append({
                        **post,
                        'category': 'Other'
                    })
            except Exception as e:
                print(f"Categorization error: {e}")
                categorized_posts.append({
                    **post,
                    'category': 'Other'
                })
        
        return jsonify(categorized_posts)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
