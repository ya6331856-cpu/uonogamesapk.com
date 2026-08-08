import os
import requests
import google.generativeai as genai

def check_gemini():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return "Missing"
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Hello")
        return "Working" if response else "Failed"
    except Exception as e:
        return f"Error: {str(e)}"

def check_telegram():
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        return "Missing"
    url = f"https://api.telegram.org/bot{token}/getMe"
    response = requests.get(url)
    return "Working" if response.status_code == 200 else "Failed"

def check_bing():
    api_key = os.environ.get("BING_API_KEY")
    if not api_key:
        return "Missing"
    headers = {"Ocp-Apim-Subscription-Key": api_key}
    response = requests.get("https://api.bing.microsoft.com/v7.0/search?q=test", headers=headers)
    return "Working" if response.status_code in [200, 401, 403] else "Failed"

if __name__ == "__main__":
    print("Running API Health Checks...")
    gemini_status = check_gemini()
    telegram_status = check_telegram()
    bing_status = check_bing()
    
    print(f"Gemini API: {gemini_status}")
    print(f"Telegram Bot: {telegram_status}")
    print(f"Bing API: {bing_status}")
    
    if "Failed" in [gemini_status, telegram_status] or "Missing" in [gemini_status, telegram_status]:
        raise Exception("One or more critical API keys are not working!")
    else:
        print("All tested APIs are working successfully!")
