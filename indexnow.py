import requests

host = "www.uonogamesapk.com"
key = "uonogamesapkindexnowkey"  # Yeh aapki IndexNow key hai
key_location = f"https://{host}/{key}.txt"

url_list = [
    f"https://{host}/",
    # Aap yahan aur bhi URLs add kar sakte hain
]

endpoint = "https://api.indexnow.org/indexnow"

payload = {
    "host": host,
    "key": key,
    "keyLocation": key_location,
    "urlList": url_list
}

headers = {
    "Content-Type": "application/json; charset=utf-8"
}

try:
    response = requests.post(endpoint, json=payload, headers=headers)
    print("IndexNow Status Code:", response.status_code)
    print("IndexNow Response:", response.text)
except Exception as e:
    print("Error calling IndexNow API:", str(e))
