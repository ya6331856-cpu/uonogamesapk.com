import os
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


def main():
  urls_to_check = {
      "Homepage": "https://www.uonogamesapk.com/",
      "Sitemap": "https://www.uonogamesapk.com/sitemap.xml",
      "Admin SEO Dashboard": "https://www.uonogamesapk.com/admin/seo-dashboard",
      "Blog Post Automation": "https://www.uonogamesapk.com/api/blog",
  }

  failed = []
  for name, url in urls_to_check.items():
    try:
      res = requests.get(url, timeout=10)
      if res.status_code not in [200, 400, 405]:
        failed.append(f"{name} (Status: {res.status_code})")
    except Exception:
      failed.append(f"{name} (Unreachable)")

  if failed:
    error_msg = (
        "⚠️ <b>24/7 Automation Alert!</b>\n\nIssues found in:\n- "
        + "\n- ".join(failed)
    )
    send_telegram_message(error_msg)
  else:
    success_msg = (
        "🟢 <b>24/7 Master Runner Status</b>\n\nAll systems, APIs and monitors"
        " are running smoothly!"
    )
    send_telegram_message(success_msg)


if __name__ == "__main__":
  main()
