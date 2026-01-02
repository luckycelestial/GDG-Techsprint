def categorize_post(title, body):
    """
    Categorize a post based on keywords in title and body.
    Returns the most relevant category.
    """
    # Combine title and body for analysis
    text = (title + ' ' + body).lower()

    # Category keywords (as specified in requirements)
    categories = {
        'Academic': ['exam', 'class', 'grade', 'professor', 'study', 'assignment', 'test', 'course'],
        'Financial': ['loan', 'tuition', 'fees', 'money', 'afford', 'cost', 'debt', 'scholarship'],
        'Mental Health': ['stress', 'anxiety', 'depression', 'mental', 'overwhelmed', 'burnout'],
        'Housing': ['dorm', 'rent', 'apartment', 'housing', 'roommate', 'lease', 'residence']
    }

    # Count matches for each category
    category_scores = {}
    for category, keywords in categories.items():
        score = sum(1 for keyword in keywords if keyword in text)
        category_scores[category] = score

    # Return category with highest score, or 'Other' if no matches
    if max(category_scores.values()) > 0:
        return max(category_scores, key=category_scores.get)
    else:
        return 'Other'
