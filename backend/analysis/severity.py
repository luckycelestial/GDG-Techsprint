def calculate_severity(score, num_comments, top_comment_scores):
    """
    Calculate severity score based on engagement metrics.
    Returns severity score and level.
    """
    # Weights for different engagement factors
    score_weight = 0.4
    comments_weight = 0.4
    top_comments_weight = 0.2

    # Normalize and calculate weighted score
    # Score normalization (based on actual data range: 0-200 typical)
    normalized_score = min(score / 200, 1.0)

    # Comments normalization (based on actual data range: 0-100 typical)
    normalized_comments = min(num_comments / 100, 1.0)

    # Top comments score (sum of top comment scores, max around 100)
    top_comments_total = sum(comment.get('comment_score', 0) for comment in top_comment_scores)
    normalized_top_comments = min(top_comments_total / 100, 1.0)

    # Calculate weighted severity score (0-100)
    severity_score = (
        normalized_score * score_weight * 100 +
        normalized_comments * comments_weight * 100 +
        normalized_top_comments * top_comments_weight * 100
    )

    # Determine severity level with more realistic thresholds
    if severity_score >= 25:
        severity_level = 'High'
    elif severity_score >= 10:
        severity_level = 'Medium'
    else:
        severity_level = 'Low'

    return round(severity_score, 1), severity_level
