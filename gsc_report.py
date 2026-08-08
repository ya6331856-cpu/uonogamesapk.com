import os
import json
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build

sa_key_json = os.environ.get("GCP_SA_KEY")
if not sa_key_json:
    raise ValueError("GCP_SA_KEY secret not found!")

sa_info = json.loads(sa_key_json)

credentials = service_account.Credentials.from_service_account_info(
    sa_info, scopes=["https://www.googleapis.com/auth/webmasters.readonly"]
)

service = build("searchconsole", "v1", credentials=credentials)

site_url = "https://www.uonogamesapk.com/"

request = {
    "startDate": "2026-07-01",
    "endDate": "2026-08-01",
    "dimensions": ["query"],
    "rowLimit": 5
}

def send_telegram_report(report_text):
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    if token and chat_id:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": f"📊 *Google Search Console Daily Report*\n\n{report_text}",
            "parse_mode": "Markdown"
        }
        try:
            requests.post(url, json=payload)
            print("GSC Daily Summary sent to Telegram!")
        except Exception as e:
            print(f"Failed to send GSC report: {e}")

try:
    response = service.searchanalytics().query(siteUrl=site_url, body=request).execute()
    rows = response.get("rows", [])
    print("Top Search Queries & Clicks:")
    
    report_lines = []
    for row in rows:
        q = row['keys'][0]
        clicks = row['clicks']
        impressions = row['impressions']
        line = f"Query: {q} | Clicks: {clicks} | Impressions: {impressions}"
        print(line)
        report_lines.append(line)
        
    if report_lines:
        send_telegram_report("\n".join(report_lines))
    else:
        send_telegram_report("No search queries data found for this period.")

except Exception as e:
    print(f"Error fetching GSC data: {str(e)}")
