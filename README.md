# College Problems Categorizer

Single-page app that pulls posts from r/college, categorizes them into problem areas, tags severity, and lets you explore/filter. Optional analytics view reads cached data from the browser.

## Quick start

1) Install Node.js (https://nodejs.org)
2) Install deps: `npm install`
3) Run server: `npm start`
4) Open: http://localhost:3000

## Usage

- Sorting: choose Hot/New/Top/Rising from the dropdown; the All box resets to Hot.
- Filters: category pills and severity pills filter the fetched posts client-side.
- Expand posts: toggle long posts with Show More/Show Less.
- Analyze: click Analyze Data to store the current dataset in `localStorage` (`collegeProblemsData`) and open analytics.html.

## How it works

- Backend: [server.js](server.js) serves static files and proxies Reddit at `/api/reddit/:subreddit?sort=hot|new|top|rising` (default hot) to avoid CORS issues.
- Frontend: [index.html](index.html) fetches posts, applies keyword-based category/severity, renders filters, and manages state in-memory.
- Data flow: fetch → categorize (fallback keywords) → render → optional analytics handoff via `localStorage`.

## Notes

- Requires internet access to reach reddit.com.
- If you run a Python AI categorizer later, point the calls in `index.html` to it; current build uses the fallback keyword categorizer only.