import os
import requests
from bs4 import BeautifulSoup

def send_telegram_alert(message):
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    if token and chat_id:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {"chat_id": chat_id, "text": message, "parse_mode": "Markdown"}
        try:
            requests.post(url, json=payload)
        except Exception as e:
            print(f"Failed to send Telegram alert: {e}")

def check_images():
    print("Checking for broken images and assets...")
    url = "https://www.uonogamesapk.com"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            print("Could not load homepage for asset check.")
            return

        soup = BeautifulSoup(response.text, 'html.parser')
        images = soup.find_all('img')
        broken_count = 0

        for img in images:
            img_url = img.get('src')
            if img_url:
                if img_url.startswith('/'):
                    img_url = url + img_url
                elif not img_url.startswith('http'):
                    continue
                
                try:
                    img_res = requests.head(img_url, timeout=5)
                    if img_res.status_code >= 400:
                        broken_count += 1
                except Exception:
                    pass

        if broken_count > 0:
            msg = f"⚠️ *Asset Alert*: Found {broken_count} broken images/assets on your website!"
            send_telegram_alert(msg)
            print(f"Found {broken_count} broken assets and alerted via Telegram.")
        else:
            print("All checked images and assets are working fine!")

    except Exception as e:
        print(f"Error during image check: {str(e)}")

if __name__ == "__main__":
    check_images()
