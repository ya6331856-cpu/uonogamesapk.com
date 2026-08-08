import os
import requests

# PageSpeed Insights API URL
API_KEY = os.environ.get("GOOGLE_PAGESPEED_API_KEY") # Isse secrets mein add karna hoga
URL = "https://www.uonogamesapk.com"
API_URL = f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={URL}&strategy=mobile&key={API_KEY}"

def check_speed():
    try:
        response = requests.get(API_URL).json()
        score = response['lighthouseResult']['categories']['performance']['score'] * 100
        msg = f"🚀 *Website Performance Update*\n\nURL: {URL}\nMobile Performance Score: {score}/100"
        
        # Telegram par alert bhejein
        token = os.environ.get("TELEGRAM_BOT_TOKEN")
        chat_id = os.environ.get("TELEGRAM_CHAT_ID")
        requests.post(f"https://api.telegram.org/bot{token}/sendMessage", 
                      json={"chat_id": chat_id, "text": msg, "parse_mode": "Markdown"})
    except Exception as e:
        print(f"Error checking speed: {e}")

if __name__ == "__main__":
    check_speed()
