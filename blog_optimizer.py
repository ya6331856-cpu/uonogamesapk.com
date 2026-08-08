import os
import json
import time
import google.generativeai as genai

# Gemini API Configuration
genai.configure(api_key="YOUR_API_KEY")  # Apna Gemini API Key yahan daalein
model = genai.GenerativeModel('gemini-1.5-flash')

# Files & Apps List
APPS_LIST = ["Yono Rummy", "Spin Gold", "Spin Crush", "Bingo101", "GOGO Rummy"]  # Yahan games ki list daalein
COMPLETED_FILE = "completed_blogs.txt"
OUTPUT_FILE = "generated_blogs.json"

def get_completed_blogs():
    if not os.path.exists(COMPLETED_FILE):
        return set()
    with open(COMPLETED_FILE, "r") as f:
        return set(line.strip() for line in f)

def save_blog(app_name, content):
    data = {}
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = {}
    
    data[app_name] = content
    with open(OUTPUT_FILE, "w") as f:
        json.dump(data, f, indent=4)
    
    with open(COMPLETED_FILE, "a") as f:
        f.write(app_name + "\n")

def generate_blog(app_name):
    prompt = f"Write a professional blog post for {app_name} APK download. Include SEO title, meta description, and content for a gaming website."
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        if "429" in str(e):
            print("Quota exhausted! Stopping script safely.")
            exit(0)
        print(f"Error: {e}")
        return None

# Main Loop
completed = get_completed_blogs()
for app in APPS_LIST:
    if app not in completed:
        print(f"Generating blog for: {app}")
        blog_content = generate_blog(app)
        if blog_content:
            save_blog(app, blog_content)
            time.sleep(5)
