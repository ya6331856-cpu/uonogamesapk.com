import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

def analyze_opportunities():
    print("Connecting to Google Search Console API...")
    
    json_creds = os.environ.get("GSC_SERVICE_ACCOUNT_JSON") or os.environ.get("GOOGLE_SERVICE_ACCOUNT")
    
    if not json_creds:
        print("Error: GSC service account credentials not found in secrets!")
        return

    try:
        creds_dict = json.loads(json_creds)
        scopes = ["https://www.googleapis.com/auth/webmasters.readonly"]
        credentials = service_account.Credentials.from_service_account_info(creds_dict, scopes=scopes)
        
        service = build('webmasters', 'v3', credentials=credentials)
        site_url = "https://uonogamesapk.com/"
        
        request = {
            'startDate': '28DaysAgo',
            'endDate': 'today',
            'dimensions': ['query', 'page'],
            'rowLimit': 100
        }
        
        response = service.searchanalytics().query(siteUrl=site_url, body=request).execute()
        rows = response.get('rows', [])
        
        opportunities = []
        for row in rows:
            query = row['keys'][0]
            page = row['keys'][1]
            clicks = row['clicks']
            impressions = row['impressions']
            position = row['position']
            ctr = (clicks / impressions) * 100 if impressions > 0 else 0
            
            if 3 <= position <= 25:
                priority = "HIGH (Striking Distance)" if position <= 12 else "MEDIUM"
                opportunities.append({
                    "query": query,
                    "url": page,
                    "impressions": impressions,
                    "clicks": clicks,
                    "position": round(position, 1),
                    "ctr": round(ctr, 2),
                    "priority": priority
                })
                
        if opportunities:
            report_path = "seo_opportunities.json"
            with open(report_path, 'w') as f:
                json.dump(opportunities, f, indent=2)
            print(f"Success! Found {len(opportunities)} real ranking keywords saved to {report_path}.")
        else:
            print("API connected, but no keywords found in the specified position range.")

    except Exception as e:
        print(f"Error fetching data from GSC API: {e}")

if __name__ == '__main__':
    analyze_opportunities()
