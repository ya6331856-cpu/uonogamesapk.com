import os
import json
import time
import requests

COMPLETED_FILE = "completed_apps.txt"

# Gemini model
MODEL_NAME = "gemini-2.5-flash"

# Gemini API endpoint
API_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{MODEL_NAME}:generateContent"
)


def load_completed_apps():
    """Load already processed apps from completed_apps.txt."""
    if not os.path.exists(COMPLETED_FILE):
        return set()

    try:
        with open(COMPLETED_FILE, "r", encoding="utf-8") as file:
            return {
                line.strip()
                for line in file
                if line.strip()
            }
    except Exception as error:
        print(f"Error loading completed apps: {error}")
        return set()


def save_completed_app(app_name):
    """Save successfully processed app name."""
    try:
        with open(COMPLETED_FILE, "a", encoding="utf-8") as file:
            file.write(app_name + "\n")

    except Exception as error:
        print(f"Error saving completed app '{app_name}': {error}")


def clean_json_response(text):
    """
    Remove markdown code fences if Gemini returns:
    ```json
    {...}
    ```
    """

    text = text.strip()

    if text.startswith("```json"):
        text = text[7:]

    elif text.startswith("```"):
        text = text[3:]

    if text.endswith("```"):
        text = text[:-3]

    return text.strip()


def generate_ai_seo(app_name):
    """Generate SEO title and description using Gemini."""

    print(f"\n--- Generating AI SEO for: {app_name} ---")

    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        print("ERROR: GEMINI_API_KEY not found in GitHub Secrets.")
        return "ERROR"

    prompt = f"""
You are an expert SEO content writer for a gaming APK website.

Create unique SEO content for this gaming app:

App Name: {app_name}

Requirements:

1. Create a unique SEO title.
2. Create a natural, useful and engaging description.
3. Mention the app name naturally.
4. Include relevant keywords such as:
   - latest version
   - APK download
   - Android
   - installation
5. Do not keyword stuff.
6. Do not make unsupported guarantees.
7. Do not claim that an app is trusted, safe, licensed,
   or pays real cash unless this is explicitly provided.
8. Do not use misleading clickbait.
9. Make the content different from other apps.
10. Return ONLY valid JSON.

Required JSON format:

{{
    "title": "SEO title here",
    "description": "SEO description here"
}}
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.8,
            "responseMimeType": "application/json"
        }
    }

    headers = {
        "Content-Type": "application/json"
    }

    params = {
        "key": api_key
    }

    try:
        response = requests.post(
            API_URL,
            headers=headers,
            params=params,
            json=payload,
            timeout=60
        )

    except requests.exceptions.Timeout:
        print(f"Request timeout for: {app_name}")
        return "ERROR"

    except requests.exceptions.RequestException as error:
        print(f"Network error for {app_name}: {error}")
        return "ERROR"

    # -----------------------------
    # SUCCESS
    # -----------------------------

    if response.status_code == 200:

        try:
            res_data = response.json()

            ai_text = (
                res_data["candidates"][0]
                ["content"]["parts"][0]["text"]
            )

            ai_text = clean_json_response(ai_text)

            seo_data = json.loads(ai_text)

            title = seo_data.get("title", "").strip()
            description = seo_data.get("description", "").strip()

            if not title or not description:
                print(f"Invalid SEO response for {app_name}")
                print(ai_text)
                return "ERROR"

            print(f"\nSEO Generated Successfully: {app_name}")
            print(f"Title: {title}")
            print(f"Description: {description}")

            # Save generated result
            output_file = "generated_seo.json"

            existing_data = {}

            if os.path.exists(output_file):
                try:
                    with open(
                        output_file,
                        "r",
                        encoding="utf-8"
                    ) as file:
                        existing_data = json.load(file)

                except (json.JSONDecodeError, OSError):
                    existing_data = {}

            existing_data[app_name] = {
                "title": title,
                "description": description
            }

            with open(
                output_file,
                "w",
                encoding="utf-8"
            ) as file:
                json.dump(
                    existing_data,
                    file,
                    indent=2,
                    ensure_ascii=False
                )

            # Mark as completed ONLY after successful processing
            save_completed_app(app_name)

            return True

        except (KeyError, IndexError, json.JSONDecodeError) as error:
            print(f"Parsing error for {app_name}: {error}")
            print("Raw response:")
            print(response.text)
            return "ERROR"

        except Exception as error:
            print(f"Unexpected error for {app_name}: {error}")
            return "ERROR"

    # -----------------------------
    # QUOTA
    # -----------------------------

    elif response.status_code == 429:

        print(f"\nQUOTA LIMIT REACHED while processing: {app_name}")
        print("Stopping script safely.")
        return "QUOTA_EXCEEDED"

    # -----------------------------
    # INVALID API KEY
    # -----------------------------

    elif response.status_code in (401, 403):

        print("\nAPI KEY ERROR")
        print(f"HTTP Status: {response.status_code}")
        print(response.text)

        return "API_KEY_ERROR"

    # -----------------------------
    # MODEL / API ERROR
    # -----------------------------

    elif response.status_code == 404:

        print("\nGEMINI MODEL/API NOT FOUND")
        print(f"Model: {MODEL_NAME}")
        print(response.text)

        return "API_ERROR"

    # -----------------------------
    # OTHER ERROR
    # -----------------------------

    else:

        print(
            f"\nGemini API Error for {app_name}: "
            f"{response.status_code}"
        )

        print(response.text)

        return "ERROR"


# ==========================================================
# MAIN
# ==========================================================

if __name__ == "__main__":

    apps_list = [
        "Yono Rummy",
        "Bingo101",
        "Yono Arcade",
        "Max Rummy",
        "Diwa Slots",
        "Spin Winner",
        "Boss Rummy",
        "INR Rummy",
        "Jaiho Slots",
        "Rummy 888",
        "Rummy 77",
        "Rummy Ludo",
        "Ok Rummy",
        "Hindi 777",
        "789 Jackpot",
        "Game Rummy",
        "Rumble Rummy",
        "Yes Spin",
        "Love Rummy",
        "Share Slots",
        "Maha Games",
        "Hi Rummy",
        "777 Game",
        "Ind Club",
        "Ind Rummy"
    ]

    completed_apps = load_completed_apps()

    print("=" * 60)
    print("AI SEO OPTIMIZER STARTED")
    print("=" * 60)

    print(f"Completed apps: {len(completed_apps)}")
    print(f"Total apps: {len(apps_list)}")

    for app in apps_list:

        # Skip completed apps
        if app in completed_apps:
            print(f"\nSKIPPING: {app}")
            continue

        result = generate_ai_seo(app)

        # Stop on quota
        if result == "QUOTA_EXCEEDED":

            print("\n" + "=" * 60)
            print("QUOTA EXCEEDED")
            print("Script stopped safely.")
            print("Run it again later to continue.")
            print("=" * 60)

            break

        # Stop on API key problem
        if result == "API_KEY_ERROR":

            print("\n" + "=" * 60)
            print("API KEY ERROR")
            print("Check GEMINI_API_KEY in GitHub Secrets.")
            print("=" * 60)

            break

        # For temporary/unknown error,
        # continue with next app.
        if result == "ERROR":

            print(f"Failed: {app}")
            print("Continuing with next app...")
            continue

        # Wait between requests
        print("\nWaiting 15 seconds before next request...")
        time.sleep(15)

    print("\n" + "=" * 60)
    print("AI SEO OPTIMIZER FINISHED")
    print("=" * 60)
