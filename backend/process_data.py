import json
import os
from analysis.categorize import categorize_post
from analysis.severity import calculate_severity

def process_reddit_data():
    """Process raw Reddit data and add categorization and severity analysis."""

    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_file = os.path.join(script_dir, 'data', 'reddit_processed.json')

    # Load raw data
    with open(data_file, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    processed_data = []

    for post in raw_data:
        # Categorize the post
        category = categorize_post(post['title'], post['body'])

        # Calculate severity
        severity_score, severity_level = calculate_severity(
            post['score'],
            post['num_comments'],
            post['top_comments']
        )

        # Create processed post
        processed_post = {
            **post,  # Include all original fields
            'category': category,
            'severity_score': severity_score,
            'severity_level': severity_level
        }

        processed_data.append(processed_post)

    # Save processed data
    with open(data_file, 'w') as f:
        json.dump(processed_data, f, indent=2)

    print(f"Processed {len(processed_data)} posts successfully!")

if __name__ == "__main__":
    process_reddit_data()
