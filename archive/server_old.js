const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;
const PERPLEXITY_API_KEY = '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';

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.get('/api/reddit/:subreddit', async (req, res) => {
    try {
        const { subreddit } = req.params;
        const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=100`, {
            headers: {
                'User-Agent': 'CollegeProblemTracker/1.0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Reddit API error: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching Reddit data:', error);
        res.status(500).json({ error: 'Failed to fetch Reddit data' });
    }
});

app.post('/api/summarize', async (req, res) => {
    try {
        const { title, content } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [{
                    role: 'user',
                    content: `Provide a concise 2-3 sentence summary of this college student's problem. Focus on the main issue and key details:\n\nTitle: ${title}\n\nContent: ${content}`
                }],
                max_tokens: 150,
                temperature: 0.3
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Perplexity API error:', response.status, errorText);
            throw new Error(`Perplexity API error: ${response.status}`);
        }
        
        const data = await response.json();
        const summary = data.choices[0].message.content.trim();
        
        res.json({ summary });
    } catch (error) {
        console.error('Error generating summary:', error);
        res.status(500).json({ error: 'Failed to generate summary', details: error.message });
    }
});

// New endpoint to fetch Reddit data using Python script
app.get('/api/fetch-reddit-python', (req, res) => {
    console.log('Fetching Reddit data using Python script...');
    
    const python = spawn('python', ['fetch_reddit.py']);
    let dataString = '';
    let errorString = '';
    
    python.stdout.on('data', (data) => {
        dataString += data.toString();
    });
    
    python.stderr.on('data', (data) => {
        errorString += data.toString();
    });
    
    python.on('close', (code) => {
        if (code !== 0) {
            console.error('Python script failed:', errorString);
            return res.status(500).json({ 
                error: 'Failed to fetch Reddit data',
                details: errorString 
            });
        }
        
        try {
            const problems = JSON.parse(dataString);
            console.log(`Successfully fetched ${problems.length} problems`);
            res.json(problems);
        } catch (error) {
            console.error('Failed to parse JSON:', error);
            res.status(500).json({ 
                error: 'Failed to parse Reddit data',
                details: error.message 
            });
        }
    });
    
    // Set timeout
    setTimeout(() => {
        python.kill();
    }, 30000); // 30 second timeout
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Open http://localhost:3000 in your browser');
});