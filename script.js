class CollegeStudentProblemTracker {
    constructor() {
        this.problems = [];
        this.currentFilter = 'all';
        this.currentSeverityFilter = 'all';
        this.summary = { total_posts: 0, high: 0, medium: 0, low: 0 };
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDataFromBackend();
    }

    bindEvents() {
        document.getElementById('fetchBtn').addEventListener('click', () => this.loadDataFromBackend());

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterProblems(e.target.dataset.category));
        });

        document.querySelectorAll('.severity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterBySeverity(e.target.dataset.severity));
        });
    }

    async loadDataFromBackend() {
        this.showLoading(true);

        try {
            // Fetch posts and summary data from backend
            const [postsResponse, summaryResponse] = await Promise.all([
                fetch('http://localhost:5000/api/posts'),
                fetch('http://localhost:5000/api/summary')
            ]);

            if (!postsResponse.ok || !summaryResponse.ok) {
                throw new Error('Failed to fetch data from backend');
            }

            const posts = await postsResponse.json();
            const summary = await summaryResponse.json();

            // Transform backend data to frontend format
            this.problems = posts.map(post => ({
                title: post.title,
                content: post.body,
                category: post.category,
                severity: post.severity,
                severity_level: post.severity_level,
                url: `https://reddit.com/r/college/${post.post_id}`,
                score: post.score,
                num_comments: post.num_comments,
                created: new Date(post.created_utc * 1000)
            }));

            this.summary = summary;
            this.updateSummaryDisplay();
            this.displayProblems();

        } catch (error) {
            console.error('Error:', error);
            alert('Error loading data from backend. Make sure the backend is running on port 5000.');
        } finally {
            this.showLoading(false);
        }
    }

    updateSummaryDisplay() {
        // Update summary stats in the UI
        const summaryElement = document.getElementById('summary');
        if (summaryElement) {
            summaryElement.style.display = 'flex';
            summaryElement.innerHTML = `
                <div class="summary-item">
                    <span class="summary-label">Total Posts:</span>
                    <span class="summary-value">${this.summary.total_posts}</span>
                </div>
                <div class="summary-item high">
                    <span class="summary-label">High Severity:</span>
                    <span class="summary-value">${this.summary.high}</span>
                </div>
                <div class="summary-item medium">
                    <span class="summary-label">Medium Severity:</span>
                    <span class="summary-value">${this.summary.medium}</span>
                </div>
                <div class="summary-item low">
                    <span class="summary-label">Low Severity:</span>
                    <span class="summary-value">${this.summary.low}</span>
                </div>
            `;
        }
    }

    showLoading(show) {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            if (show) {
                loadingElement.style.display = 'block';
                loadingElement.classList.remove('hidden');
            } else {
                loadingElement.style.display = 'none';
                loadingElement.classList.add('hidden');
            }
        }
        const fetchBtn = document.getElementById('fetchBtn');
        if (fetchBtn) {
            fetchBtn.disabled = show;
        }
    }

    filterProblems(category) {
        this.currentFilter = category;

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        this.displayProblems();
    }

    filterBySeverity(severity) {
        this.currentSeverityFilter = severity;

        document.querySelectorAll('.severity-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.severity === severity);
        });

        this.displayProblems();
    }

    displayProblems() {
        let filteredProblems = this.problems;

        // Apply category filter
        if (this.currentFilter !== 'all') {
            filteredProblems = filteredProblems.filter(p => p.category.toLowerCase() === this.currentFilter.toLowerCase());
        }

        // Apply severity filter
        if (this.currentSeverityFilter !== 'all') {
            filteredProblems = filteredProblems.filter(p => p.severity_level.toLowerCase() === this.currentSeverityFilter);
        }

        const problemsList = document.getElementById('problemsList');
        problemsList.innerHTML = '';

        if (filteredProblems.length === 0) {
            problemsList.innerHTML = '<div style="padding: 40px; text-align: center; color: #666;">No problems found matching the current filters.</div>';
            return;
        }

        filteredProblems.forEach(problem => {
            const problemElement = document.createElement('div');
            problemElement.className = 'problem-item';

            const severityClass = problem.severity_level.toLowerCase();
            const severityIcon = {
                'high': '🔴',
                'medium': '🟡',
                'low': '🟢'
            }[severityClass] || '⚪';

            problemElement.innerHTML = `
                <div class="problem-header">
                    <div class="problem-title">${this.escapeHtml(problem.title)}</div>
                    <div class="category-tag">${problem.category}</div>
                    <div class="severity-tag ${severityClass}">${severityIcon} ${problem.severity_level}</div>
                </div>
                <div class="problem-content">${this.escapeHtml(problem.content)}</div>
                <div class="problem-meta">
                    <span>⬆️ ${problem.score}</span>
                    <span>💬 ${problem.num_comments}</span>
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
