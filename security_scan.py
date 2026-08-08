import os
import subprocess
import requests

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

def run_security_check():
    print("Running security dependency check...")
    try:
        # safety tool ka use karke installed packages mein known vulnerabilities check karna
        result = subprocess.run(["safety", "check", "--json"], capture_output=True, text=True)
        
        if result.returncode != 0:
            msg = "🚨 *Security Alert: Vulnerable Dependencies Found!*\n\nPlease check your requirements.py or dependencies for outdated/unsafe packages."
            send_telegram_alert(msg)
            print("Vulnerabilities detected and alert sent.")
        else:
            print("No security vulnerabilities found. All dependencies are safe!")
            
    except Exception as e:
        print(f"Error running security scan: {e}")

if __name__ == "__main__":
    run_security_check()
