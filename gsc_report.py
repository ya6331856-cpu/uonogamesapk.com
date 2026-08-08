import os
import json
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
    "rowLimit": 10
}

try:
    response = service.searchanalytics().query(siteUrl=site_url, body=request).execute()
    rows = response.get("rows", [])
    print("Top Search Queries & Clicks:")
    for row in rows:
        print(f"Query: {row['keys'][0]} | Clicks: {row['clicks']} | Impressions: {row['impressions']}")
except Exception as e:
    print("Error fetching GSC data:", str(e))
