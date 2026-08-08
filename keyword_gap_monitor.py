import os
import json
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build

def get_gap_keywords():
    # Setup GSC Service
    sa_key_json = json.loads(os.environ.get("GCP_SA_KEY"))
    creds = service_account.Credentials.from_service_account_info(
        sa_key_json, scopes=["https://www.googleapis.com/auth/webmasters.readonly"]
    )
    service = build("searchconsole", "v1", credentials=creds)
    
    # Query for rank 11 to 20
    request = {
        "startDate": "2026-07-01",
        "endDate": "2026-08-01",
        "dimensions": ["query"],
        "rowLimit": 5
    }
    
    # Logic: Search Analytics API mein filtering lagani padegi
    response = service.searchanalytics().query(siteUrl="https://www.uonogamesapk.com/", body=request).execute()
    rows = response.get("rows", [])
    
    gap_keywords = [row['keys'][0] for row in rows if 11 <= row['position'] <= 20]
    
    if gap_keywords:
        msg = f"🚀 *Content Gap Alert*: In keywords ko optimize karke 1st page par la sakte hain:\n" + "\n".join(gap_keywords)
        requests.post(f"https://api.telegram.org/bot{os.environ.get('TELEGRAM_BOT_TOKEN')}/sendMessage", 
                      json={"chat_id": os.environ.get("TELEGRAM_CHAT_ID"), "text": msg, "parse_mode": "Markdown"})

if __name__ == "__main__":
    get_gap_keywords()
