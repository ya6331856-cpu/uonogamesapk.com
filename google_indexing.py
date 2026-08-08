import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

# GitHub Secret se credentials load karna
sa_key_json = os.environ.get("GCP_SA_KEY")
if not sa_key_json:
    raise ValueError("GCP_SA_KEY secret not found!")

sa_info = json.loads(sa_key_json)
credentials = service_account.Credentials.from_service_account_info(
    sa_info, scopes=["https://www.googleapis.com/auth/indexing"]
)

service = build("indexing", "v3", credentials=credentials)

# Aapka URL jise Google ko turant index karwana hai
url_to_index = "https://www.uonogamesapk.com/"

body = {
    "url": url_to_index,
    "type": "URL_UPDATED"
}

try:
    request = service.urlNotifications().publish(body=body)
    response = request.execute()
    print("Indexing API Response:", response)
except Exception as e:
    print("Error calling Indexing API:", str(e))
