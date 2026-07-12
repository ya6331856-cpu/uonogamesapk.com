import asyncio
import os
import base64
import requests
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv("/app/backend/.env")

BANNER_URL = "https://customer-assets.emergentagent.com/job_smooth-apk-market/artifacts/v3bj8g6j_file_00000000fb0c71fa83328054fe82b267.webp"
OUT_PATH = "/app/frontend/public/hero-banner.png"


async def main():
    resp = requests.get(BANNER_URL, timeout=60)
    resp.raise_for_status()
    image_base_64 = base64.b64encode(resp.content).decode("utf-8")

    api_key = os.getenv("EMERGENT_LLM_KEY")
    chat = LlmChat(api_key=api_key, session_id="banner-edit", system_message="You are an expert graphic editor.")
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])

    prompt = (
        "Edit this promotional banner. On the LEFT side there is a golden crown logo badge that currently reads "
        "'ALLYONO RUMMY' with a green ribbon saying 'APK DOWNLOAD'. Completely REMOVE that 'ALLYONO RUMMY' text and the "
        "'APK DOWNLOAD' ribbon text, and instead render bold premium golden 3D text 'UONOGAMESAPK.COM' in the same golden "
        "crown-badge style and position. Keep the exact same luxury black-and-gold casino theme, the golden crown on top, "
        "the poker chips and spade symbols. Do NOT change anything else in the banner: keep 'PLAY RUMMY WIN REAL CASH', the "
        "playing cards, the golden shield with spade, the poker chips, the green felt, the feature icons (100% SECURE, FAIR "
        "PLAY, 24/7 SUPPORT, FAST WITHDRAWAL) and the 'DOWNLOAD NOW' button exactly as they are. Maintain the same wide "
        "banner aspect ratio and high quality."
    )

    msg = UserMessage(text=prompt, file_contents=[ImageContent(image_base_64)])
    text, images = await chat.send_message_multimodal_response(msg)
    print("Text response (truncated):", (text or "")[:120])
    if images:
        image_bytes = base64.b64decode(images[0]["data"])
        with open(OUT_PATH, "wb") as f:
            f.write(image_bytes)
        print(f"Saved edited banner to {OUT_PATH} ({len(image_bytes)} bytes)")
    else:
        print("No images returned")


if __name__ == "__main__":
    asyncio.run(main())
