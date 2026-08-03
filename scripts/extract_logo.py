"""Precise crops for the YONO GAMES showcase image (1254x1254).

Strategy: use the clean HERO image (top of showcase) and crop the shield+crown
region for icons — this avoids picking up tile labels and neighboring tiles.
"""
from pathlib import Path
from PIL import Image

BRAND = Path("/app/frontend/public/brand")
PUBLIC = Path("/app/frontend/public")

src = Image.open(BRAND / "yonogames-showcase.png").convert("RGBA")
W, H = src.size  # 1254 x 1254

# ---- Hero: full brand block (top area) ----
hero = src.crop((40, 20, W - 40, 770))
hero.save(BRAND / "yg-hero.png", optimize=True)

# ---- Shield + crown (extracted directly from hero) ----
# In the hero, the shield with YG + crown lives around x=[435, 810], y=[45, 440]
shield_only = src.crop((435, 45, 810, 445))
sw, sh = shield_only.size
side = max(sw, sh)
# Center on transparent black canvas so we get a square with the shield centered
square = Image.new("RGBA", (side, side), (0, 0, 0, 255))
square.paste(shield_only, ((side - sw) // 2, (side - sh) // 2), shield_only)
square.save(BRAND / "yg-shield.png", optimize=True)

# ---- Header horizontal logo: shield + text on one line, extracted from hero ----
# YONO GAMES lockup lives at y ≈ 400..570, spanning most of the width
# For a horizontal header we crop shield + "YONO GAMES" text
header_lockup = src.crop((150, 400, W - 150, 620))
header_lockup.save(BRAND / "yg-header.png", optimize=True)
header_lockup.save(PUBLIC / "logo-header.png", optimize=True)

# ---- Footer: same lockup + tagline ----
footer_lockup = src.crop((150, 400, W - 150, 700))
footer_lockup.save(BRAND / "yg-footer.png", optimize=True)
footer_lockup.save(PUBLIC / "logo-footer.png", optimize=True)

# ---- Public root aliases ----
# Main hero logo
hero_out = hero.copy()
hero_out.thumbnail((1024, 1024), Image.LANCZOS)
hero_out.save(PUBLIC / "logo-v2.png", optimize=True)

# Small YG shield icon — clean square from the hero shield region
square.resize((512, 512), Image.LANCZOS).save(PUBLIC / "logo-icon-v2.png", optimize=True)

# Favicon multi-size
square.resize((32, 32), Image.LANCZOS).save(PUBLIC / "favicon-32.png", optimize=True)
square.resize((16, 16), Image.LANCZOS).save(PUBLIC / "favicon-16.png", optimize=True)

# Apple touch icon (iOS home screen)
square.resize((180, 180), Image.LANCZOS).save(PUBLIC / "apple-touch-icon.png", optimize=True)

# PWA icons — square with dark background (matches Android app icon style)
square.resize((192, 192), Image.LANCZOS).save(PUBLIC / "icon-192.png", optimize=True)
square.resize((512, 512), Image.LANCZOS).save(PUBLIC / "icon-512.png", optimize=True)

# ICO (Windows / Chrome legacy)
square.resize((256, 256), Image.LANCZOS).save(
    PUBLIC / "favicon.ico", format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
)

# All standard sizes in /brand for reference
for s in (16, 32, 48, 64, 96, 128, 180, 192, 256, 384, 512):
    square.resize((s, s), Image.LANCZOS).save(BRAND / f"yg-icon-{s}.png", optimize=True)

print("Done.")
