# College Student Problem Tracker

A web app that fetches college student problems from Reddit and categorizes them using Perplexity AI.

## Features

- Fetches posts from college-focused subreddits
- Uses Perplexity AI for intelligent categorization
- Categories: Academic Stress, Social & Relationships, Financial Struggles, Mental Health, Career Anxiety, Living Situations
- Clean, responsive web interface
- GitHub Pages ready

## Setup

1. Get a Perplexity API key from [perplexity.ai](https://perplexity.ai)
2. Open `index.html` in your browser
3. Enter a college subreddit (e.g., "college", "university", "CollegeRant")
4. Enter your Perplexity API key
5. Click "Fetch & Categorize"

## Recommended Subreddits

- `college` - General college discussions
- `university` - University-specific content
- `CollegeRant` - Student complaints and issues
- `ApplyingToCollege` - Application stress
- `college_advice` - Academic guidance
- `StudentLoans` - Financial struggles

## Deploy to GitHub Pages

1. Push files to your GitHub repository
2. Go to Settings > Pages
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)"
5. Your app will be live at `https://yourusername.github.io/repositoryname`

## Note

This app uses client-side Reddit API calls which may be limited by CORS. For production use, consider adding a backend proxy.