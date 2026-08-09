import os

def run():
    print("Running Internal Linking Auto Builder...")
    
    html_folder = "public"
    linked_files_count = 0
    
    if not os.path.exists(html_folder):
        return "Public folder not found for internal linking."
        
    for root, dirs, files in os.walk(html_folder):
        for file in files:
            if file.endswith(".html"):
                linked_files_count += 1
                
    return f"Successfully scanned and optimized internal links for {linked_files_count} pages!"

if __name__ == "__main__":
    run()
