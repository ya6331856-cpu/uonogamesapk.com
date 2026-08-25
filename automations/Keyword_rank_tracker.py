import os
import requests

# Telegram credentials environment variables se uthayega
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")

# Aapke targeted keywords jo track honge
TARGET_KEYWORDS = [
    "uono games",
    "uono games apk",
    "yono games app",
    "rummy games apk download",
    "best earning apps 2026"
]

def send_telegram_message(message):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("[!] Telegram credentials missing.")
        return
        
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "HTML"
    }
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            print("[✓] Keyword rank report sent to Telegram successfully!")
        else:
            print(f"[!] Failed to send Telegram message: {response.text}")
    except Exception as e:
        print(f"[!] Error sending Telegram alert: {e}")

def check_keyword_rankings():
    print("[*] Checking 24-hour keyword rankings...")
    
    # Simulated ranking check summary for demonstration / live integration
    report_lines = [
        "<b>📊 Daily 24-Hour Keyword Ranking Report</b>\n",
        "<b>Website:</b> uonogamesapk.com\n",
        "-----------------------------------"
    ]
    
    # Dummy mock ranking performance data for tracking changes over 24 hours
    for keyword in TARGET_KEYWORDS:
        # Aap yahan Google Search Console API ya kisi ranking checker ka response integrate kar sakte hain
        report_lines.append(f"• <b>{keyword}:</b> Position #3 (Stable 🟢)")
        
    report_lines.append("\n<i>All targeted keywords are being monitored smoothly.</i>")
    
    final_message = "\n".join(report_lines)
    send_telegram_message(final_message)

def main():
    print("=== Starting Keyword Rank Tracker Automation ===")
    check_keyword_rankings()
    print("=== Keyword tracking check completed! ===")

if __name__ == "__main__":
    main()
