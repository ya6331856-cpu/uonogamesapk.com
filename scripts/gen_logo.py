import asyncio
import os
import base64
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv("/app/backend/.env")

OUT_PATH = "/app/frontend/public/logo.png"
ICON_PATH = "/app/frontend/public/logo-icon.png"


async def gen(prompt, out_path, session):
    chat = LlmChat(api_key=os.getenv("EMERGENT_LLM_KEY"), session_id=session, system_message="You are an expert brand logo designer.")
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])
    _, images = await chat.send_message_multimodal_response(UserMessage(text=prompt))
    if images:
        with open(out_path, "wb") as f:
            f.write(base64.b64decode(images[0]["data"]))
        print(f"Saved {out_path} ({len(images[0]['data'])} b64 chars)")
    else:
        print("No image for", out_path)


async def main():
    logo_prompt = (
        "Design a premium horizontal brand logo emblem. BACKGROUND: a rich rummy / casino theme — deep dark green felt "
        "table blending into black, with subtle scattered playing cards (spade & heart), glossy poker chips (red, gold, black) "
        "and soft golden bokeh light glows in the corners. FOREGROUND: on the left a luxurious glossy golden crown combined with "
        "a red playing-card spade, 3D gold gradient (#FFC107 to #FFB300) with shine. On the right the brand text "
        "'UONOGAMESAPK.COM' in a bold modern elegant font — 'UONOGAMES' in bright WHITE and 'APK.COM' in premium glossy GOLD, "
        "clearly readable with a subtle glow so it pops against the dark background. Luxurious, high-end, cinematic, crisp, "
        "wide banner logo aspect ratio, no watermark, no extra text. High resolution."
    )
    await gen(logo_prompt, OUT_PATH, "logo-gen-2")


if __name__ == "__main__":
    asyncio.run(main())
