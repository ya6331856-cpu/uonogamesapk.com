import os
import json
import tempfile
from google.oauth2 import service_account
from googleapiclient.discovery import build

def analyze_opportunities():
    print("Connecting to Google Search Console API...")
    
    # GitHub Secret se JSON data read karna
    json_creds = os.environ.get("GSC_SERVICE_ACCOUNT_JSON") or os.environ.get("GOOGLE_SERVICE_ACCOUNT")
    
    if not json_creds:
        print("Error: GSC service account credentials not found in environment secrets!")
        return

    try:
        # Temporary file mein credentials likh kar authenticate karna
        creds_dict = json.loads(json_creds)
        scopes = ["https://www.googleapis.com/auth/webmasters.readonly"]
        credentials = service_account.Credentials.from_service_account_info(creds_dict, scopes=scopes)
        
        service = build('webmasters', 'v3', credentials=credentials)
        
        # Aapki website ka property URL (Search Console ke mutabiq)
        site_url = os.environ.get("SITE_URL", "https://uonogamesapk.com/")
        
        # Pichle 28 dino ka data fetch karne ki request
        request = {
            'startDate': '28DaysAgo',
            'endDate': 'today',
            'dimensions': ['query', 'page'],
            'rowLimit': 50
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
            
            # Striking Distance logic (Position 4 se 20 ke beech)
            if 4 <= position <= 20:
                priority = "HIGH (Striking Distance)" if position <= 11 else "MEDIUM"
                opportunities.append({
                    "query": query,
                    "url": page,
                    "impressions": impressions,
                    "clicks": clicks,
                    "position": round(position, 1),
                    "ctr": round(ctr, 2),
                    "priority": priority
                })
                
        report_path = "seo_opportunities.json"
        with open(report_path, 'w') as f:
            json.dump(opportunities, f, indent=2)
            
        print(f"Analysis complete. Found {len(opportunities)} real ranking opportunities saved to {report_path}.")

    except Exception as e:
        print(f"Error connecting to GSC API: {e}")

if __name__ == '__main__':
    analyze_opportunities()
