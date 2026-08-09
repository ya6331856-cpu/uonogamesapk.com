import os
import importlib.util
import requests

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")

def send_telegram_message(message):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "HTML"}
    try:
        requests.post(url, json=payload, timeout=10)
    except Exception as e:
        print(f"Telegram error: {e}")

def run_dynamic_automations():
    folder = 'automations'
    report = []
    
    # automations folder mein har file check karo
    if not os.path.exists(folder):
        return ["No automations folder found."]

    for filename in os.listdir(folder):
        if filename.endswith(".py") and filename != "__init__.py":
            script_path = os.path.join(folder, filename)
            try:
                # Dynamic import: Har script ko as a module load karo
                spec = importlib.util.spec_from_file_location(filename[:-3], script_path)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                
                # Agar script mein run() function hai, toh use call karo
                if hasattr(module, 'run'):
                    result = module.run()
                    report.append(f"✅ <b>{filename}:</b> {result}")
                else:
                    report.append(f"⚠️ <b>{filename}:</b> No run() function found.")
            except Exception as e:
                report.append(f"❌ <b>{filename}:</b> Failed with error: {str(e)}")
    
    return report

def main():
    results = run_dynamic_automations()
    msg = "🚀 <b>24/7 Master Runner: Dynamic Report</b>\n\n" + "\n".join(results)
    send_telegram_message(msg)

if __name__ == "__main__":
    main()
