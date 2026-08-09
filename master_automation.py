import os
import requests

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")

def send_telegram_message(message):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "HTML"}
    requests.post(url, json=payload, timeout=10)

def main():
    # Yahan saare endpoints list karein
    urls_to_check = {
        "Homepage": "https://www.uonogamesapk.com/",
        "Sitemap": "https://www.uonogamesapk.com/sitemap.xml",
        "Admin SEO Dashboard": "https://www.uonogamesapk.com/admin/seo-dashboard",
        "Blog Post Automation": "https://www.uonogamesapk.com/api/blog",
        "Sitemap Ping": "https://www.uonogamesapk.com/api/ping-sitemap",
    }

    success = []
    failed = []

    for name, url in urls_to_check.items():
        try:
            res = requests.get(url, timeout=15)
            # Sirf 200, 400, 405 ko "theek" manenge, baki sab "gadbad"
            if res.status_code in [200, 400, 405]:
                success.append(f"✅ <b>{name}</b>: OK ({res.status_code})")
            else:
                failed.append(f"❌ <b>{name}</b>: Failed (Status: {res.status_code})")
        except Exception as e:
            failed.append(f"⚠️ <b>{name}</b>: Error ({str(e)})")

    # Final Report Tayaar Karna
    if failed:
        msg = "⚠️ <b>System Health Report: Gadbad Detected!</b>\n\n" + "\n".join(failed)
        if success:
            msg += "\n\n<b>Operational:</b>\n" + "\n".join(success)
    else:
        msg = "🟢 <b>System Health Report: All Good!</b>\n\n" + "\n".join(success)

    send_telegram_message(msg)

if __name__ == "__main__":
    main()
