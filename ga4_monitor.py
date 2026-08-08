import os
import json
import requests
from google.oauth2 import service_account
from googleanalytics.data_beta import BetaAnalyticsDataClient # type: ignore
from googleanalytics.data_beta.types import DateRange, Metric, RunReportRequest # type: ignore

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

def check_ga4_traffic():
    print("Checking Google Analytics 4 traffic...")
    sa_key_json = os.environ.get("GCP_SA_KEY")
    property_id = os.environ.get("GA4_PROPERTY_ID") # Aapki GA4 Property ID
    
    if not sa_key_json or not property_id:
        print("GA4 Property ID or GCP_SA_KEY missing.")
        return

    try:
        sa_info = json.loads(sa_key_json)
        credentials = service_account.Credentials.from_service_account_info(
            sa_info, scopes=["https://www.googleapis.com/auth/analytics.readonly"]
        )
        
        client = BetaAnalyticsDataClient(credentials=credentials)
        
        request = RunReportRequest(
            property=f"properties/{property_id}",
            date_ranges=[DateRange(start_date="yesterday", end_date="today")],
            metrics=[Metric(name="activeUsers")]
        )
        
        response = client.run_report(request)
        for row in response.rows:
            users = row.metric_values[0].value
            msg = f"📊 *GA4 Traffic Update*: Yesterday active users on your site: *{users}*"
            send_telegram_alert(msg)
            print(f"Traffic report sent: {users} users.")
            
    except Exception as e:
        print(f"Error fetching GA4 data: {str(e)}")

if __name__ == "__main__":
    check_ga4_traffic()
