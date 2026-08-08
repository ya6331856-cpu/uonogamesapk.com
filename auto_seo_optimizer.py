import os
import requests
import json

def optimize_game_seo(app_name):
    print(f"--- Generating AI SEO for: {app_name} ---")
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found in secrets!")
        return

    # Gemini API Endpoint
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
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
            print("AI Generated SEO Content:\n", ai_text)
        except Exception as e:
            print("Parsing Error:", e)
            print("Raw Response:", res_data)
    else:
        print(f"API Error: {response.status_code} - {response.text}")

if __name__ == "__main__":
    optimize_game_seo("Yono Rummy")
