const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

app.use(cors());
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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Open http://localhost:3000 in your browser');
});