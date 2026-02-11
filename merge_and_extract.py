import json
import os
import re

def get_filename_from_content(content):
    first_line = content.strip().split('\n')[0].strip()
    # Check for comments like // path/to/file or # path/to/file or <!-- path/to/file -->
    # Regex for common patterns
    match = re.search(r'^(\/\/|#|<!--)\s*([a-zA-Z0-9_\-\.\/]+)', first_line)
    if match:
        potential_path = match.group(2).strip()
        # Clean up HTML comment suffix if needed
        if '-->' in potential_path:
            potential_path = potential_path.replace('-->', '').strip()
        # Basic validation: must contain a slash or be a known filename
        if '/' in potential_path or '.' in potential_path:
            return potential_path
    
    # Check for direct filename (sometimes just "filename.ext")
    if '/' in first_line and '.' in first_line and len(first_line) < 100:
         return first_line.strip()
         
    return None

def main():
    # 1. Load indices for fallback
    indices_map = {}
    try:
        with open('indices.json', 'r') as f:
            indices_list = json.load(f)
            indices_map = {item['index']: item['filename'] for item in indices_list}
    except Exception as e:
        print(f"Warning: Could not load indices.json: {e}")

    # 2. Find and load all batch files
    batch_files = [f for f in os.listdir('.') if f.startswith('batch_') and f.endswith('.json')]
    print(f"Found batch files: {batch_files}")

    all_blocks = []
    for bf in batch_files:
        try:
            with open(bf, 'r') as f:
                blocks = json.load(f)
                all_blocks.extend(blocks)
        except Exception as e:
            print(f"Error loading {bf}: {e}")

    print(f"Total code blocks found: {len(all_blocks)}")

    # 3. Extract logic
    success_count = 0
    for block in all_blocks:
        idx = block.get('index')
        content = block.get('content', '')
        
        # Determine filename
        filename = get_filename_from_content(content)
        
        # Fallback to indices.json if no filename in content
        if not filename and idx in indices_map:
            filename = indices_map[idx]
        
        if not filename:
            print(f"Skipping block index {idx}: Could not determine filename.")
            continue
            
        # Clean filename (remove leading slashes, etc)
        filename = filename.lstrip('/')
        
        # Ensure dir exists
        dirname = os.path.dirname(filename)
        if dirname:
            os.makedirs(dirname, exist_ok=True)
            
        # Write file
        try:
            with open(filename, 'w') as f:
                f.write(content)
            success_count += 1
            print(f"Wrote {filename} (from index {idx})")
        except Exception as e:
            print(f"Error writing {filename}: {e}")

    print(f"\nExtraction complete. {success_count} files written.")

if __name__ == "__main__":
    main()
