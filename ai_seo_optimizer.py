import os
import requests
import json

def generate_ai_seo(app_name):
    print(f"--- Generating AI SEO for: {app_name} ---")
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found in secrets!")
        return

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
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
    else:
        print(f"API Error: {response.status_code} - {response.text}")

if __name__ == "__main__":
    # Dynamic list support: Future mein aap yahan apne saare apps add kar sakte hain ya dynamic scan laga sakte hain
    apps_list = ["Yono Rummy", "Teen Patti Gold", "Lucky Spin APK"]
    
    for app in apps_list:
        generate_ai_seo(app)
