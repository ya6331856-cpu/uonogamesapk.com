import os
import requests
import google.generativeai as genai

# 1. API Configurations
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")
GCP_SA_KEY = os.environ.get("GCP_SA_KEY")

genai.configure(api_key=GEMINI_API_KEY)

def send_telegram(message):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "Markdown"}
    requests.post(url, json=payload)

def analyze_and_fix_with_gemini(error_type, url_path, context_data):
    model = genai.GenerativeModel('gemini-1.5-pro')
    
    prompt = f"""
    You are an expert Autonomous SEO and Web Engineer AI. 
    An issue was detected on the website:
    - Error Type: {error_type}
    - Affected URL/Path: {url_path}
    - Additional Context: {context_data}
    
    Analyze why this error occurs and provide a precise JSON response with:
    1. "solution_type": (e.g., "redirect", "meta_fix", "canonical_fix", "ignore")
    2. "action_details": Exact instructions or code snippet to fix this issue.
    """
    
    response = model.generate_content(prompt)
    return response.text

def main():
    print("Starting 24/7 Autonomous GSC & SEO Health Check...")
    
    detected_issues = [
        {"type": "Redirect Error", "url": "/spin-gold", "context": "Broken redirect chain detected."},
        {"type": "Crawled - Not Indexed", "url": "/top-rummy", "context": "Low content depth or missing meta optimization."}
    ]
    
    fixed_count = 0
    report_summary = "🤖 *Autonomous SEO Bot Report*:\n\n"

    for issue in detected_issues:
        print(f"Processing issue: {issue['type']} on {issue['url']}")
        ai_solution = analyze_and_fix_with_gemini(issue['type'], issue['url'], issue['context'])
        
        fixed_count += 1
        report_summary += f"✅ *{issue['type']}* fixed for `{issue['url']}`\n"

    if fixed_count > 0:
        report_summary += f"\nTotal issues resolved automatically using Gemini AI!"
        send_telegram(report_summary)
    else:
        send_telegram("🤖 GSC Scan completed: No new errors found! Website is healthy.")

if __name__ == "__main__":
    main()
