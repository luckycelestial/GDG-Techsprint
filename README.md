# Setup Instructions

## Quick Start

1. **Install Node.js** (if not installed): Download from nodejs.org

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Start the server**:
   ```
   npm start
   ```

4. **Open browser**: Go to `http://localhost:3000`

## Features

- **Real-time data** from r/college (most recent posts)
- **Foolproof fetching** via local backend proxy
- **Auto-refresh** every 30 seconds
- **Live categorization** using Perplexity AI
- **Time stamps** showing when posts were created

## How it works

- Backend server (`server.js`) fetches from Reddit API
- Frontend calls local backend (no CORS issues)
- AI categorizes each post in real-time
- Auto-refresh keeps data current

This is the most reliable way to fetch Reddit data locally!