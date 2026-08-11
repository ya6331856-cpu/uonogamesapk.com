import os
import json

def analyze_opportunities():
    print("Analyzing Search Console performance metrics...")
    
    # Deterministic opportunity scoring based on position, impressions, and CTR
    # Striking distance: Position 11-20 or 4-10 with low CTR
    mock_queries = [
        {"query": "gogo rummy apk", "url": "/gogo-rummy", "impressions": 2450, "clicks": 45, "position": 12.4},
        {"query": "win rummy apk", "url": "/win-rummy", "impressions": 1900, "clicks": 21, "position": 16.8},
        {"query": "yono games apk download", "url": "/", "impressions": 5200, "clicks": 180, "position": 6.2}
    ]
    
    opportunities = []
    for item in mock_queries:
        ctr = (item["clicks"] / item["impressions"]) * 100 if item["impressions"] > 0 else 0
        score = 0
        priority = "LOW"
        
        if 11 <= item["position"] <= 20 and item["impressions"] > 1000:
            score = 85
            priority = "HIGH (Striking Distance)"
        elif 4 <= item["position"] <= 10 and ctr < 2.0:
            score = 90
            priority = "HIGH (Low CTR Optimization)"
            
        if score > 0:
            opportunities.append({
                "query": item["query"],
                "url": item["url"],
                "impressions": item["impressions"],
                "position": item["position"],
                "ctr": round(ctr, 2),
                "priority": priority
            })
            
    report_path = "seo_opportunities.json"
    with open(report_path, "w") as f:
        json.dump(opportunities, f, indent=2)
        
    print(f"Analysis complete. Found {len(opportunities)} ranking opportunities saved to {report_path}.")

if __name__ == "__main__":
    analyze_opportunities()
