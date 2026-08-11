import os
import json
import glob
from datetime import datetime
import google.generativeai as genai

def analyze_and_optimize():
    print("Running Gemini AI SEO Generator...")
    
    api_keys = [
        os.environ.get("GEMINI_API_KEY"),
        os.environ.get("GEMINI_API_KEY_2"),
        os.environ.get("GEMINI_API_KEY_3"),
        os.environ.get("GEMINI_API_KEY_4")
    ]
    
    valid_keys = [key for key in api_keys if key]
    
    if not valid_keys:
        print("Error: No Gemini API keys found!")
        return

    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Direct aur fresh prompt jo 5 alag naye gaming apps ke liye data dega
    prompt = f"""
    Generate a JSON array of 61 highly optimized SEO opportunities for different gaming and earning apps (like yono games, yono Rummy, Uono, games, rummy all Games, all yono, yono all new games, new yono games, yono arcade, yono rummy, jaiho Arcade, download all yono apk, new rummy, 2026 yono games, download all yono games, yono games list , uono games, download all yono, new 2026 yono, uono games download apps, all yono apps, rummy games download, ).
    Current time: {current_time}
    
    Each item must have these exact keys:
    - "query": string (keyword)
    - "url": string (path)
    - "impressions": number
    - "clicks": number
    - "position": float
    - "ctr": float
    - "priority": string
    - "optimized_title": string
    - "optimized_description": string
    
    Return ONLY valid raw JSON array. No markdown, no extra text.
    """

    opportunities = []
    for i, api_key in enumerate(valid_keys):
        try:
            print(f"Trying API Key #{i+1}...")
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-pro")
            response = model.generate_content(prompt)
            text_response = response.text.strip()
            
            if text_response.startswith("```json"):
                text_response = text_response[7:]
            if text_response.startswith("```"):
                text_response = text_response[3:]
            if text_response.endswith("```"):
                text_response = text_response[:-3]
                
            opportunities = json.loads(text_response.strip())
            print(f"Success with API Key #{i+1}! Got {len(opportunities)} items.")
            break
        except Exception as e:
            print(f"API Key #{i+1} error: {e}. Trying next...")
            continue

    if not opportunities:
        print("Error: Could not generate data from Gemini keys.")
        return

    # File ko naye data ke sath save karna
    report_path = "seo_opportunities.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(opportunities, f, indent=2)
    print("seo_opportunities.json successfully updated with new apps!")

if __name__ == '__main__':
    analyze_and_optimize()
