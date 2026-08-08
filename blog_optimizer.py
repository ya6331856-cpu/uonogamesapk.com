import os
import json
import time
import google.generativeai as genai

# ============================================================
# GEMINI API CONFIGURATION
# ============================================================

API_KEY = os.environ.get("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError(
        "GEMINI_API_KEY environment variable nahi mili. "
        "Pehle apni Gemini API key set karein."
    )

genai.configure(api_key=API_KEY)

MODEL_NAME = "gemini-2.0-flash"
model = genai.GenerativeModel(MODEL_NAME)


# ============================================================
# FILE CONFIGURATION
# ============================================================

COMPLETED_FILE = "completed_blogs.txt"
OUTPUT_FILE = "generated_blogs.json"


# ============================================================
# DEFAULT APPS
# ============================================================

DEFAULT_APPS = [
    "Yono Rummy",
    "Spin Gold",
    "Spin Crush",
    "Bingo101",
    "GOGO Rummy"
]


# ============================================================
# SETTINGS
# ============================================================

DELAY_BETWEEN_REQUESTS = 15
MAX_RETRIES = 3


# ============================================================
# GET APPS LIST
# ============================================================

def get_apps_list():
    """
    Default apps + generated_blogs.json me already available
    apps ko combine karta hai.
    """

    apps = set(DEFAULT_APPS)

    if os.path.exists(OUTPUT_FILE):
        try:
            with open(
                OUTPUT_FILE,
                "r",
                encoding="utf-8"
            ) as f:

                data = json.load(f)

                if isinstance(data, dict):
                    for app in data.keys():
                        apps.add(app)

        except json.JSONDecodeError:
            print(
                f"Warning: {OUTPUT_FILE} valid JSON nahi hai. "
                "Sirf default apps use kiye jayenge."
            )

        except Exception as e:
            print(f"Apps list read karne me error: {e}")

    return sorted(apps)


# ============================================================
# GET COMPLETED BLOGS
# ============================================================

def get_completed_blogs():
    """
    completed_blogs.txt se already generated apps read karta hai.
    """

    if not os.path.exists(COMPLETED_FILE):
        return set()

    try:
        with open(
            COMPLETED_FILE,
            "r",
            encoding="utf-8"
        ) as f:

            return {
                line.strip()
                for line in f
                if line.strip()
            }

    except Exception as e:
        print(f"Completed blogs read karne me error: {e}")
        return set()


# ============================================================
# LOAD EXISTING JSON
# ============================================================

def load_existing_data():
    """
    generated_blogs.json ka existing data load karta hai.
    """

    if not os.path.exists(OUTPUT_FILE):
        return {}

    try:
        with open(
            OUTPUT_FILE,
            "r",
            encoding="utf-8"
        ) as f:

            data = json.load(f)

            if isinstance(data, dict):
                return data

            return {}

    except json.JSONDecodeError:
        print(
            f"Warning: {OUTPUT_FILE corrupt/invalid hai. "
            "New JSON file create ki jayegi."
        )
        return {}

    except Exception as e:
        print(f"JSON load error: {e}")
        return {}


# ============================================================
# SAVE BLOG
# ============================================================

def save_blog(app_name, content):
    """
    Blog ko generated_blogs.json me save karta hai
    aur app ko completed_blogs.txt me mark karta hai.
    """

    data = load_existing_data()

    data[app_name] = content

    try:
        with open(
            OUTPUT_FILE,
            "w",
            encoding="utf-8"
        ) as f:

            json.dump(
                data,
                f,
                indent=4,
                ensure_ascii=False
            )

        # Duplicate entry avoid karne ke liye
        completed = get_completed_blogs()

        if app_name not in completed:
            with open(
                COMPLETED_FILE,
                "a",
                encoding="utf-8"
            ) as f:

                f.write(app_name + "\n")

        print(
            f"✓ Successfully saved: {app_name}"
        )

    except Exception as e:
        print(
            f"Blog save karne me error "
            f"({app_name}): {e}"
        )


# ============================================================
# GEMINI BLOG PROMPT
# ============================================================

def build_prompt(app_name):

    return f"""
You are an expert SEO content writer specializing in APK,
mobile gaming and app download websites.

Write a high-quality, original and useful SEO blog/article
for:

{app_name}

The article should be suitable for a gaming/APK website.

IMPORTANT:
- Do not copy existing articles.
- Make the content unique.
- Do not make fake claims.
- Do not use keyword stuffing.
- Keep the writing natural and useful.
- Avoid unnecessary repetition.
- Do not mention that the content was generated by AI.

Return the article in this exact structure:

SEO TITLE:
A unique SEO-friendly title between 50-60 characters.

META DESCRIPTION:
A compelling meta description around 150-160 characters.

FOCUS KEYWORDS:
Provide 8-12 relevant keywords.

SLUG:
Create a short SEO-friendly URL slug.

INTRODUCTION:
Write an engaging introduction.

WHAT IS {app_name.upper()}?
Explain the app/game clearly.

KEY FEATURES:
Give useful bullet points describing commonly relevant
features. Do not invent specific features if they are unknown.

HOW TO DOWNLOAD {app_name.upper()} APK:
Give a general and safe APK download explanation.
Do not provide fake download links.

HOW TO INSTALL {app_name.upper()} APK:
Explain Android installation steps clearly.

HOW TO USE {app_name.upper()}:
Give beginner-friendly general guidance.

PROS AND CONS:
Provide realistic pros and cons without making unsupported
claims.

SAFETY TIPS:
Explain how users can stay safe when downloading APK files,
including checking the source and scanning files.

FAQ:
Create 5 useful SEO-friendly frequently asked questions
with concise answers.

CONCLUSION:
Write a natural conclusion.

Target length:
Approximately 900-1200 words.

Language:
Simple, professional English.

Do not use Markdown tables.
"""


# ============================================================
# GENERATE BLOG
# ============================================================

def generate_blog(app_name):

    prompt = build_prompt(app_name)

    for attempt in range(1, MAX_RETRIES + 1):

        try:

            print(
                f"Sending request to Gemini "
                f"(attempt {attempt}/{MAX_RETRIES})..."
            )

            response = model.generate_content(prompt)

            if not response:
                print("Gemini returned an empty response.")
                continue

            content = getattr(response, "text", None)

            if not content:
                print("Gemini response me text nahi mila.")
                continue

            content = content.strip()

            if len(content) < 100:
                print(
                    "Generated content bahut short hai. "
                    "Retrying..."
                )
                continue

            return content

        except Exception as e:

            error_message = str(e)

            # ------------------------------------------------
            # QUOTA / RATE LIMIT
            # ------------------------------------------------

            if (
                "429" in error_message
                or "quota" in error_message.lower()
                or "rate limit" in error_message.lower()
            ):

                print(
                    "\n⚠️ Gemini quota/rate limit reached."
                )

                print(
                    "Script safely stop ho rahi hai."
                )

                return None

            # ------------------------------------------------
            # OTHER ERROR
            # ------------------------------------------------

            print(
                f"Gemini API error: {error_message}"
            )

            if attempt < MAX_RETRIES:

                wait_time = 10 * attempt

                print(
                    f"Retrying in {wait_time} seconds..."
                )

                time.sleep(wait_time)

    return None


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 60)
    print("       GEMINI SEO BLOG GENERATOR")
    print("=" * 60)

    # --------------------------------------------------------
    # Load data
    # --------------------------------------------------------

    completed = get_completed
