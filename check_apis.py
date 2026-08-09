import os
import requests

# GitHub Secrets se automatically utha lega
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")

# Yahan apni website ke wo URLs / APIs daalein jinhe monitor karna hai
APIS_TO_CHECK = {
    "Homepage": "https://www.uonogamesapk.com/",
    "Sitemap": "https://www.uonogamesapk.com/sitemap.xml",
    "Admin SEO Dashboard": "https://www.uonogamesapk.com/admin/seo-dashboard",
}


def send_telegram_message(message):
  url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
  payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "HTML"}
  try:
    requests.post(url, json=payload, timeout=10)
  except Exception as e:
    print(f"Failed to send telegram message: {e}")


def main():
  success_list = []
  failed_list = []

  for name, url in APIS_TO_CHECK.items():
    try:
      response = requests.get(url, timeout=15)
      # Agar status code 200 (OK) hai toh success maana jayega
      if response.status_code == 200:
        success_list.append(f"✅ <b>{name}</b> is working (Status: 200)")
      else:
        failed_list.append(
            f"❌ <b>{name}</b> returned status {response.status_code}"
        )
    except Exception as e:
      failed_list.append(
          f"❌ <b>{name}</b> is down/unreachable! Error: {str(e)}"
      )

  # 1. Agar koi API fail hoti hai, toh sirf Error Alert bhejega
  if failed_list:
    error_msg = (
        "⚠️ <b>API & Automation Health Alert!</b>\n\n"
        + "\n".join(failed_list)
        + "\n\n<i>Please check your server or GitHub actions.</i>"
    )
    send_telegram_message(error_msg)

  # 2. Agar sabhi APIs bilkul theek hain, toh Success message bhejega
  if success_list and not failed_list:
    success_msg = (
        "🟢 <b>All Systems Operational</b>\n\n"
        + "\n".join(success_list)
        + "\n\n<i>All monitored endpoints are running smoothly.</i>"
    )
    send_telegram_message(success_msg)


if __name__ == "__main__":
  main()
