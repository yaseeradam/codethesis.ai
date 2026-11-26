import json
import os

db_path = '/var/www/codethesis/web/data/codethesis_db.json'
if os.path.exists(db_path):
    with open(db_path, 'r', encoding='utf-8') as f:
        db = json.load(f)
    projects = db.get('projects', [])
    print(f"Total projects: {len(projects)}")
    for i, p in enumerate(projects):
        title = p.get('title') or p.get('topic') or 'Untitled'
        print(f"--- Project {i}: {title} ---")
        chapters = p.get('chapters', {})
        for k, v in chapters.items():
            if '3' in str(k) and v:
                lines = v.split('\n')
                print(f"  Chapter {k} lines 1-12:")
                for l in lines[:12]:
                    print("   ", repr(l))
else:
    print("DB file not found")
