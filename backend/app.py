from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)

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
    """Categorize posts using Google Gemini AI."""
    try:
        data = request.json
        posts = data.get('posts', [])
        
        categories = [
            'Academic Issues',
            'Financial Problems',
            'Housing & Accommodation',
            'Social & Relationships',
            'Mental Health',
            'Food & Dining',
            'Transportation',
            'Other'
        ]
        
        categorized_posts = []
        
        # Use Gemini model
        model = genai.GenerativeModel('gemini-pro')
        
        for post in posts:
            try:
                prompt = f"""Categorize this college student problem into exactly ONE of these categories: {', '.join(categories)}. 
Respond with ONLY the category name, nothing else.

Problem Title: {post['title']}
Problem Details: {post['content']}"""
                
                response = model.generate_content(prompt)
                category = response.text.strip()
                
                # Validate category
                if category not in categories:
                    category = 'Other'
                
                categorized_posts.append({
                    **post,
                    'category': category
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
