import os
import google.generativeai as genai

# Saari Gemini API keys ki list jo GitHub Secrets se automatically uthegi
API_KEYS = [
    os.environ.get("GEMINI_API_KEY"),
    os.environ.get("GEMINI_API_KEY_2"),
    os.environ.get("GEMINI_API_KEY_3"),
    os.environ.get("GEMINI_API_KEY_4")
]

def ask_gemini_with_rotation(prompt):
    for i, key in enumerate(API_KEYS):
        if not key:
            continue
        try:
            print(f"Trying Gemini API Key {i+1}...")
            genai.configure(api_key=key)
            model = genai.GenerativeModel('gemini-1.5-pro')
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"API Key {i+1} failed or limit reached: {e}. Switching to next key...")
    
    raise Exception("All Gemini API keys have exhausted their limits or failed!")

if __name__ == "__main__":
    prompt = "Hello! Verify system connectivity and key rotation."
    try:
        result = ask_gemini_with_rotation(prompt)
        print("Gemini Response:", result)
    except Exception as err:
        print(err)
