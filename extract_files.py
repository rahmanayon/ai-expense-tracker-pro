import json
import os

def main():
    # Load indices (metadata with filenames)
    with open('indices.json', 'r') as f:
        indices = json.load(f)
    
    # Load content (the downloaded file)
    try:
        with open('project_code.json', 'r') as f:
            content_list = json.load(f)
    except FileNotFoundError:
        print("Error: project_code.json not found. Did the download succeed?")
        return

    # Create a map of index -> content
    content_map = {item['index']: item['content'] for item in content_list}
    
    # Iterate and write files
    success_count = 0
    for item in indices:
        idx = item['index']
        filename = item['filename']
        
        if idx not in content_map:
            print(f"Warning: Content for index {idx} ({filename}) not found.")
            continue
            
        code = content_map[idx]
        
        # Ensure directory exists
        dirname = os.path.dirname(filename)
        if dirname:
            os.makedirs(dirname, exist_ok=True)
            
        # Write file
        try:
            with open(filename, 'w') as f:
                f.write(code)
            success_count += 1
            print(f"Wrote {filename}")
        except Exception as e:
            print(f"Error writing {filename}: {e}")

    print(f"\nSuccessfully extracted {success_count} files.")

if __name__ == "__main__":
    main()
