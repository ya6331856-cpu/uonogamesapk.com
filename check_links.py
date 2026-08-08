import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

# Aapki website ka URL
BASE_URL = "https://www.uonogamesapk.com"

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

def check_broken_links():
    print(f"Scanning {BASE_URL} for broken links...")
    try:
        response = requests.get(BASE_URL)
        if response.status_code != 200:
            print("Failed to reach the website homepage.")
            return

        soup = BeautifulSoup(response.text, 'html.parser')
        links = set()
        
        # Saare anchor tags extract karein
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            full_url = urljoin(BASE_URL, href)
            # Sirf apni website ke internal links ya valid HTTP links check kareን
            parsed_url = urlparse(full_url)
            if parsed_url.scheme in ['http', 'https']:
                links.add(full_url)

        broken_links = []
        for link in links:
            try:
                res = requests.head(link, timeout=5, allow_redirects=True)
                # Agar status code 400 ya usse zyada hai toh link broken maana jayega
                if res.status_code >= 400:
                    broken_links.append(f"{link} (Status: {res.status_code})")
            except Exception:
                broken_links.append(f"{link} (Connection Error)")

        if broken_links:
            msg = "⚠️ *Broken Links Detected on Website!*\n\n" + "\n".join(broken_links)
            send_telegram_alert(msg)
            print("Broken links found and alert sent to Telegram.")
        else:
            print("No broken links found! All links are working fine.")

    except Exception as e:
        print(f"Error during link checking: {e}")

if __name__ == "__main__":
    check_broken_links()
