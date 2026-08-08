import os
import requests
import json
import time

def generate_ai_seo(app_name):
    print(f"--- Generating AI SEO for: {app_name} ---")
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found in secrets!")
        return

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={api_key}"

    prompt = (
        f"Write an SEO-optimized title and a viral high-converting description for a gaming app named '{app_name}'. "
        f"Include keywords like real cash, fast withdrawal, trusted APK, and download latest version. "
        f"Format the output strictly as JSON with keys 'title' and 'description'."
    )

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }

    headers = {"Content-Type": "application/json"}

    response = requests.post(url, headers=headers, data=json.dumps(payload))

    if response.status_code == 200:
        res_data = response.json()
        try:
            ai_text = res_data['candidates'][0]['content']['parts'][0]['text']
            print(f"AI Generated SEO Content for {app_name}:\n{ai_text}\n")
        except Exception as e:
            print("Parsing Error:", e)
            print("Raw Response:", res_data)
    else:
        print(f"API Error: {response.status_code} - {response.text}")

if __name__ == "__main__":
    apps_list = [
        "Yono Rummy", "Bingo101", "Yono Arcade", "Max Rummy", "Diwa Slots", 
        "Spin Winner", "Boss Rummy", "INR Rummy", "Jaiho Slots", "Rummy 888", 
        "Rummy 77", "Rummy Ludo", "Ok Rummy", "Hindi 777", "789 Jackpot", 
        "Game Rummy", "Rumble Rummy", "Yes Spin", "Love Rummy", "Share Slots", 
        "Maha Games", "Hi Rummy", "777 Game", "Ind Club", "Ind Rummy"
    ]

    for app in apps_list:
        generate_ai_seo(app)
        time.sleep(5)  # Har request ke beech 5 seconds ka gap taaki 429 quota error na aaye
