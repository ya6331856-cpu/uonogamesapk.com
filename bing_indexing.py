import os
import requests

bing_api_key = os.environ.get("BING_API_KEY")
if not bing_api_key:
    raise ValueError("BING_API_KEY secret not found!")

site_url = "https://www.newyono.games"
url_list = [
    "https://www.newyono.games/",
    # Agar aur bhi naye URLs hon toh yahan add kar sakte hain
]

endpoint = f"https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey={bing_api_key}"

payload = {
    "siteUrl": site_url,
    "urlList": url_list
}

headers = {
    "Content-Type": "application/json; charset=utf-8"
}

try:
    response = requests.post(endpoint, json=payload, headers=headers)
    print("Bing API Status Code:", response.status_code)
    print("Bing API Response:", response.text)
except Exception as e:
    print("Error calling Bing API:", str(e))
