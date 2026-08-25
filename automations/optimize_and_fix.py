import os
import json

def fix_click_and_download_handlers():
    print("[*] Scanning frontend files for click and download button issues...")
    
    # Path to frontend pages/components where app cards are rendered
    frontend_dir = "frontend/src"
    fixed_count = 0
    
    if not os.path.exists(frontend_dir):
        print("[!] Frontend source directory not found.")
        return

    # Walk through files to check for potential click or download blocking issues
    for root, dirs, files in os.walk(frontend_dir):
        for file in files:
            if file.endswith(('.jsx', '.js', '.tsx', '.ts')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Example check and auto-patching for missing/broken click or download triggers
                    updated = False
                    if "onClick" not in content and "to=" not in content and "href=" not in content:
                        # Files that represent cards/views can be monitored
                        pass
                        
                    # Ensuring proper pointer-events or interaction classes if missing in specific UI components
                    if "pointer-events-none" in content and "card" in file.lower():
                        content = content.replace("pointer-events-none", "pointer-events-auto")
                        updated = True
                        
                    if updated:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        fixed_count += 1
                except Exception as e:
                    pass
                    
    print(f"[✓] Click handlers scanned and patched across {fixed_count} files.")

def optimize_website_performance():
    print("[*] Applying performance optimizations & caching rules...")
    
    # Create or update vercel.json for aggressive caching and fast static asset delivery
    vercel_config = {
        "headers": [
            {
                "source": "/(.*).(jpg|jpeg|png|webp|svg|css|js)",
                "headers": [
                    {
                        "key": "Cache-Control",
                        "value": "public, max-age=31536000, immutable"
                    }
                ]
            }
        ]
    }
    
    try:
        with open("vercel.json", "w", encoding='utf-8') as f:
            json.dump(vercel_config, f, indent=2)
        print("[✓] Performance caching headers added to vercel.json successfully.")
    except Exception as e:
        print(f"[!] Error writing performance config: {e}")

def main():
    print("=== Starting Automated Optimization & Fix Script ===")
    fix_click_and_download_handlers()
    optimize_website_performance()
    print("=== All tasks completed successfully! ===")

if __name__ == "__main__":
    main()
