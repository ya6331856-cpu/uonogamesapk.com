import os
import json
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build

site_url = "https://www.uonogamesapk.com"
url_to_index = f"{site_url}/"

print("--- Starting Master SEO & Indexing Automation ---")

# 1. Google Indexing API Trigger
try:
    sa_key_json = os.environ.get("GCP_SA_KEY")
    if sa_key_json:
        sa_info = json.loads(sa_key_json)
        credentials = service_account.Credentials.from_service_account_info(
            sa_info, scopes=["https://www.googleapis.com/auth/indexing"]
        )
        service = build("indexing", "v3", credentials=credentials)
        body = {"url": url_to_index, "type": "URL_UPDATED"}
        response = service.urlNotifications().publish(body=body).execute()
        print("-> Google Indexing Success:", response)
    else:
        print("-> Google Indexing Skipped: GCP_SA_KEY not found")
except Exception as e:
    print("-> Google Indexing Error:", str(e))

# 2. Bing Webmaster API Trigger
try:
    bing_api_key = os.environ.get("BING_API_KEY")
    if bing_api_key:
        endpoint = f"https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey={bing_api_key}"
        payload = {"siteUrl": site_url, "urlList": [url_to_index]}
        headers = {"Content-Type": "application/json; charset=utf-8"}
        res = requests.post(endpoint, json=payload, headers=headers)
        print("-> Bing Indexing Status:", res.status_code)
    else:
        print("-> Bing Indexing Skipped: BING_API_KEY not found")
except Exception as e:
    print("-> Bing Indexing Error:", str(e))

# 3. IndexNow API Trigger (Bing, Yandex, etc.)
try:
    key = "uonogamesapkindexnowkey"
    endpoint = "https://api.indexnow.org/indexnow"
    payload = {
        "host": "www.uonogamesapk.com",
        "key": key,
        "keyLocation": f"{site_url}/{key}.txt",
        "urlList": [url_to_index]
    }
    res = requests.post(endpoint, json=payload, headers={"Content-Type": "application/json; charset=utf-8"})
    print("-> IndexNow Status:", res.status_code)
except Exception as e:
    print("-> IndexNow Error:", str(e))

print("--- Master Automation Completed ---")
