import os
import json
import requests
import subprocess
from datetime import datetime

# ===========================================================================
# TELEGRAM APPROVAL MANAGER FOR AI SEO GUARDIAN
# ===========================================================================

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

def send_telegram_alert(message):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return False
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "Markdown"}
    try:
        requests.post(url, json=payload)
        return True
    except:
        return False

def check_telegram_updates_and_execute():
    if not TELEGRAM_BOT_TOKEN:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates"
    try:
        response = requests.get(url).json()
        for result in response.get("result", []):
            text = result.get("message", {}).get("text", "").strip()
            if text == "/approve_gogorummy":
                execute_approved_changes()
    except:
        pass

def execute_approved_changes():
    build_result = subprocess.run(["npm", "run", "build"], capture_output=True, text=True)
    if build_result.returncode != 0:
        send_telegram_alert("❌ Build Failed! Aborting.")
        return
    subprocess.run(["git", "add", "."])
    subprocess.run(["git", "commit", "-m", "🤖 Approved live update for /gogo-rummy"])
    send_telegram_alert("✅ Success! SEO changes for /gogo-rummy deployed.")

if __name__ == "__main__":
    check_telegram_updates_and_execute()
