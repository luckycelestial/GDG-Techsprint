class CollegeStudentProblemTracker {
    constructor() {
        this.problems = [];
        this.currentFilter = 'all';
        this.apiKey = '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';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSampleData();
    }

    bindEvents() {
        document.getElementById('fetchBtn').addEventListener('click', () => this.fetchAndCategorize());
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterProblems(e.target.dataset.category));
        });

        document.getElementById('subredditInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.fetchAndCategorize();
        });
    }

    async fetchAndCategorize() {
        this.showLoading(true);
        
        try {
            const posts = await this.fetchRedditPosts('college');
            const categorizedProblems = await this.categorizeWithPerplexity(posts, this.apiKey);
            this.problems = categorizedProblems;
            this.displayProblems();
        } catch (error) {
            console.error('Error:', error);
            alert('Error fetching or categorizing posts. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async fetchRedditPosts(subreddit) {
        try {
            const response = await fetch(`http://localhost:3000/api/reddit/${subreddit}`);
            if (!response.ok) throw new Error('Failed to fetch Reddit posts from backend');
            
            const data = await response.json();
            
            return data.data.children
                .map(post => post.data)
                .filter(post => 
                    post.selftext && 
                    post.selftext.length > 50 && 
                    !post.stickied &&
                    this.isCollegeProblemPost(post.title, post.selftext)
                )
                .slice(0, 15)
                .map(post => ({
                    title: post.title,
                    content: post.selftext.substring(0, 500) + (post.selftext.length > 500 ? '...' : ''),
                    url: `https://reddit.com${post.permalink}`,
                    author: post.author,
                    score: post.score,
                    created: new Date(post.created_utc * 1000)
                }));
        } catch (error) {
            console.error('Backend API Error:', error);
            throw new Error('Failed to fetch Reddit posts. Make sure the backend server is running on port 3000.');
        }
    }

    isCollegeProblemPost(title, content) {
        const collegeKeywords = [
            'help', 'advice', 'struggling', 'stressed', 'anxious', 'worried', 'confused',
            'failing', 'dropped out', 'can\'t afford', 'broke', 'debt', 'loans',
            'roommate', 'dorm', 'professor', 'grade', 'exam', 'assignment',
            'depression', 'lonely', 'homesick', 'overwhelmed', 'burnout',
            'job', 'internship', 'major', 'career', 'graduate', 'what should i do'
        ];
        
        const text = (title + ' ' + content).toLowerCase();
        return collegeKeywords.some(keyword => text.includes(keyword));
    }

    async categorizeWithPerplexity(posts, apiKey) {
        const categories = [
            'Academic Stress',
            'Social & Relationships', 
            'Financial Struggles',
            'Mental Health',
            'Career Anxiety',
            'Living Situations',
            'Other'
        ];

        const categorizedProblems = [];

        for (const post of posts) {
            try {
                const response = await fetch('https://api.perplexity.ai/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'llama-3.1-sonar-small-128k-online',
                        messages: [{
                            role: 'user',
                            content: `Categorize this college student problem into exactly one of these categories: ${categories.join(', ')}. Respond with only the category name.\n\nProblem: ${post.title}\n\n${post.content}`
                        }],
                        max_tokens: 20,
                        temperature: 0.1
                    })
                });

                if (!response.ok) {
                    throw new Error(`Perplexity API error: ${response.status}`);
                }

                const data = await response.json();
                const category = data.choices[0].message.content.trim();
                
                categorizedProblems.push({
                    ...post,
                    category: categories.includes(category) ? category : 'Other'
                });

                await new Promise(resolve => setTimeout(resolve, 300));

            } catch (error) {
                console.error('Perplexity categorization error:', error);
                categorizedProblems.push({
                    ...post,
                    category: this.fallbackCategorize(post.title, post.content)
                });
            }
        }

        return categorizedProblems;
    }

    fallbackCategorize(title, content) {
        const text = (title + ' ' + content).toLowerCase();
        
        if (text.includes('grade') || text.includes('exam') || text.includes('study') || text.includes('professor') || text.includes('class')) {
            return 'Academic Stress';
        }
        if (text.includes('friend') || text.includes('relationship') || text.includes('dating') || text.includes('social')) {
            return 'Social & Relationships';
        }
        if (text.includes('money') || text.includes('loan') || text.includes('debt') || text.includes('afford') || text.includes('broke')) {
            return 'Financial Struggles';
        }
        if (text.includes('depressed') || text.includes('anxiety') || text.includes('mental') || text.includes('therapy')) {
            return 'Mental Health';
        }
        if (text.includes('job') || text.includes('career') || text.includes('internship') || text.includes('major')) {
            return 'Career Anxiety';
        }
        if (text.includes('roommate') || text.includes('dorm') || text.includes('housing') || text.includes('apartment')) {
            return 'Living Situations';
        }
        return 'Other';
    }

    loadSampleData() {
        this.problems = [
            {
                title: "Failing calculus and might lose my scholarship",
                content: "I'm a sophomore engineering major and I'm currently failing calculus 2. If I don't pass this class, I'll lose my academic scholarship...",
                category: "Academic Stress",
                url: "https://reddit.com/r/college/sample1",
                author: "stressedstudent22",
                score: 89,
                created: new Date()
            },
            {
                title: "Roommate never cleans and brings people over at 2am",
                content: "My roommate is driving me crazy. They never do dishes, leave trash everywhere, and constantly have loud friends over...",
                category: "Living Situations", 
                url: "https://reddit.com/r/college/sample2",
                author: "dormlife123",
                score: 156,
                created: new Date()
            },
            {
                title: "Can't afford textbooks this semester",
                content: "I'm already working 25 hours a week and taking out max loans. My textbooks cost $800 this semester and I just don't have it...",
                category: "Financial Struggles",
                url: "https://reddit.com/r/college/sample3", 
                author: "brokecollegekid",
                score: 234,
                created: new Date()
            },
            {
                title: "Feeling completely alone and homesick",
                content: "I'm a freshman and I haven't made any real friends yet. Everyone seems to have their groups already and I feel so isolated...",
                category: "Mental Health",
                url: "https://reddit.com/r/college/sample4", 
                author: "lonelyfreshman",
                score: 67,
                created: new Date()
            }
        ];
        
        this.displayProblems();
    }

    showLoading(show) {
        document.getElementById('loading').classList.toggle('hidden', !show);
        document.getElementById('fetchBtn').disabled = show;
    }

    filterProblems(category) {
        this.currentFilter = category;
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        this.displayProblems();
    }

    displayProblems() {
        const filteredProblems = this.currentFilter === 'all' 
            ? this.problems 
            : this.problems.filter(p => p.category === this.currentFilter);

        document.getElementById('totalCount').textContent = filteredProblems.length;
        
        const problemsList = document.getElementById('problemsList');
        problemsList.innerHTML = '';

        if (filteredProblems.length === 0) {
            problemsList.innerHTML = '<div style="padding: 40px; text-align: center; color: #666;">No college problems found. Try fetching from subreddits like: college, university, CollegeRant</div>';
            return;
        }

        filteredProblems.forEach(problem => {
            const problemElement = document.createElement('div');
            problemElement.className = 'problem-item';
            
            problemElement.innerHTML = `
                <div class="problem-header">
                    <div class="problem-title">${this.escapeHtml(problem.title)}</div>
                    <div class="category-tag">${problem.category}</div>
                </div>
                <div class="problem-content">${this.escapeHtml(problem.content)}</div>
                <div class="problem-meta">
                    <span>👤 u/${problem.author}</span>
                    <span>⬆️ ${problem.score}</span>
                    <span>🕒 ${this.formatDate(problem.created)}</span>
                    <a href="${problem.url}" target="_blank" class="reddit-link">View on Reddit</a>
                </div>
            `;
            
            problemsList.appendChild(problemElement);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CollegeStudentProblemTracker();
});