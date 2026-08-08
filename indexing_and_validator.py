import os
import requests
import xml.etree.ElementTree as ET

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

def validate_sitemap():
    print("Validating sitemap.xml...")
    sitemap_url = "https://www.uonogamesapk.com/sitemap.xml"
    try:
        response = requests.get(sitemap_url)
        if response.status_code == 200:
            content = response.content.strip()
            if not content:
                print("Sitemap is empty.")
                return
            # XML Syntax check
            ET.fromstring(content)
            print("Sitemap is valid and properly formatted!")
        else:
            print(f"Sitemap returned status code {response.status_code}")
    except Exception as e:
        print(f"Sitemap parsing notice: {str(e)}")

if __name__ == "__main__":
    validate_sitemap()
