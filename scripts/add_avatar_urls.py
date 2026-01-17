#!/usr/bin/env python3
"""
Script to add avatarUrl to all experts in aiExperts.ts that have matching photos.
"""
import os
import re

# Get all avatar files
avatars_dir = '/home/ubuntu/the-brain/client/public/avatars'
avatar_files = set()
for f in os.listdir(avatars_dir):
    if f.endswith('.jpg'):
        avatar_files.add(f.replace('.jpg', ''))

print(f"Found {len(avatar_files)} avatar files")

# Read the aiExperts.ts file
with open('/home/ubuntu/the-brain/client/src/data/aiExperts.ts', 'r') as f:
    content = f.read()

# Function to convert expert name to avatar filename
def name_to_avatar_key(name):
    """Convert expert name to potential avatar filename."""
    # Remove special characters and convert to lowercase
    name = name.lower()
    name = re.sub(r'[^a-z0-9\s-]', '', name)
    name = name.replace(' ', '-')
    return name

# Find all experts without avatarUrl and add it
def add_avatar_url(match):
    full_match = match.group(0)
    
    # Skip if already has avatarUrl
    if 'avatarUrl:' in full_match:
        return full_match
    
    # Extract name
    name_match = re.search(r"name:\s*['\"]([^'\"]+)['\"]", full_match)
    if not name_match:
        return full_match
    
    name = name_match.group(1)
    avatar_key = name_to_avatar_key(name)
    
    # Try different variations to find a matching avatar
    variations = [
        avatar_key,
        avatar_key.split('-')[0] + '-' + avatar_key.split('-')[-1] if '-' in avatar_key else avatar_key,
        '-'.join(avatar_key.split('-')[:2]) if '-' in avatar_key else avatar_key,
    ]
    
    matched_avatar = None
    for var in variations:
        if var in avatar_files:
            matched_avatar = var
            break
        # Try partial match
        for af in avatar_files:
            if var in af or af in var:
                matched_avatar = af
                break
        if matched_avatar:
            break
    
    if matched_avatar:
        # Add avatarUrl after avatar field
        avatar_pattern = r"(avatar:\s*['\"][^'\"]+['\"],?)"
        replacement = f"\\1\n    avatarUrl: '/avatars/{matched_avatar}.jpg',"
        full_match = re.sub(avatar_pattern, replacement, full_match, count=1)
        print(f"Added avatar for: {name} -> {matched_avatar}")
    
    return full_match

# Process multi-line expert definitions
pattern = r'\{\s*id:[^}]+\}'
new_content = re.sub(pattern, add_avatar_url, content, flags=re.DOTALL)

# Also handle single-line definitions
single_line_pattern = r'\{ id: [^}]+\}'
def add_avatar_url_single(match):
    full_match = match.group(0)
    
    if 'avatarUrl:' in full_match:
        return full_match
    
    name_match = re.search(r"name:\s*['\"]([^'\"]+)['\"]", full_match)
    if not name_match:
        return full_match
    
    name = name_match.group(1)
    avatar_key = name_to_avatar_key(name)
    
    # Try to find matching avatar
    matched_avatar = None
    for af in avatar_files:
        if avatar_key == af or avatar_key in af or af in avatar_key:
            matched_avatar = af
            break
        # Try first name match
        first_name = avatar_key.split('-')[0]
        if first_name in af:
            matched_avatar = af
            break
    
    if matched_avatar:
        # Insert avatarUrl after avatar field
        avatar_pattern = r"(avatar:\s*['\"][^'\"]+['\"],?)"
        replacement = f"\\1 avatarUrl: '/avatars/{matched_avatar}.jpg',"
        full_match = re.sub(avatar_pattern, replacement, full_match, count=1)
        print(f"Added avatar (single-line) for: {name} -> {matched_avatar}")
    
    return full_match

new_content = re.sub(single_line_pattern, add_avatar_url_single, new_content)

# Write back
with open('/home/ubuntu/the-brain/client/src/data/aiExperts.ts', 'w') as f:
    f.write(new_content)

print("\nDone! Updated aiExperts.ts with avatar URLs.")
