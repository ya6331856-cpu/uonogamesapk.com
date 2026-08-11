import os
import json
import glob
from datetime import datetime
import google.generativeai as genai

def analyze_and_optimize():
    print("Initializing Gemini AI SEO Guardian with Timestamp & Auto-Publisher...")
    
    api_keys = [
        os.environ.get("GEMINI_API_KEY"),
        os.environ.get("GEMINI_API_KEY_2"),
        os.environ.get("GEMINI_API_KEY_3"),
        os.environ.get("GEMINI_API_KEY_4")
    ]
    
    valid_keys = [key for key in api_keys if key]
    
    if not valid_keys:
        print("Error: No Gemini API keys found in secrets!")
        return

    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    prompt = f"""
    You are an expert AI SEO Master and Gaming Content Strategist for 'uonogamesapk.com'.
    Current execution time: {current_time}.
    Analyze current 2026 gaming trends for APK downloads (like Rummy, Teen Patti, Uono Games, Crash Games) and generate a fresh JSON array of 5 highly optimized SEO opportunities.
    Each item in the JSON array must contain:
    - "query": Target keyword string
    - "url": Recommended target path (e.g. "/", "/gogo-rummy")
    - "impressions": Estimated number
    - "clicks": Estimated number
    - "position": Current rank float
    - "ctr": Click-through rate float
    - "priority": "HIGH (100% AI Optimized)"
    - "optimized_title": A catchy, SEO-friendly 100% perfected title
    - "optimized_description": A high-converting meta description
    - "last_updated": "{current_time}"
    
    Return ONLY valid JSON format without markdown code blocks.
    """

    opportunities = []
    for i, api_key in enumerate(valid_keys):
        try:
            print(f"Trying Gemini API Key #{i+1}...")
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-pro")
            response = model.generate_content(prompt)
            text_response = response.text.strip()
            
            if text_response.startswith("```json"):
                text_response = text_response[7:]
            if text_response.endswith("```"):
                text_response = text_response[:-3]
                
            opportunities = json.loads(text_response.strip())
            print(f"Success using API Key #{i+1}! Generated {len(opportunities)} SEO items.")
            break
        except Exception as e:
            print(f"API Key #{i+1} failed: {e}. Switching...")
            continue

    if not opportunities:
        print("Error: Failed to fetch data from all Gemini keys.")
        return

    # 1. Save opportunities report with timestamp
    report_path = "seo_opportunities.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(opportunities, f, indent=2)

    # 2. Auto-publish / inject changes into frontend HTML files
    print("Auto-publishing and injecting SEO changes into frontend files...")
    html_files = glob.glob("frontend/**/*.html", recursive=True) + glob.glob("pages/**/*.html", recursive=True) + glob.glob("*.html", recursive=True)
    
    updated_count = 0
    for item in opportunities:
        target_title = item.get("optimized_title")
        
        for file_path in html_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                if "<title>" in content and "</title>" in content:
                    start = content.find("<title>")
                    end = content.find("</title>") + len("</title>")
                    content = content[:start] + f"<title>{target_title}</title>" + content[end:]
                    
                with open(file_path, 'w', encoding='utf-8') as file:
                    file.write(content)
                updated_count += 1
            except Exception as ex:
                print(f"Skipped file {file_path}: {ex}")

    print(f"Auto-Publish Complete! Updated {updated_count} files with fresh 100% AI optimized SEO data.")

if __name__ == '__main__':
    analyze_and_optimize()
