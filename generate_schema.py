import os
import json

# Aapki website ka base domain
DOMAIN = "https://uonogamesapk.com"

# Aapke games/apps ki list (Ise aap apne project ke mutabiq dynamic ya static rakh sakte hain)
games = [
    {
        "name": "Sample Game APK",
        "slug": "sample-game",
        "description": "Download the latest version of Sample Game APK for Android.",
        "version": "1.0.0",
        "category": "Game"
    }
]

for game in games:
    schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": game["name"],
        "operatingSystem": "ANDROID",
        "applicationCategory": game["category"],
        "description": game["description"],
        "softwareVersion": game["version"],
        "url": f"{DOMAIN}/games/{game['slug']}.html",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    }

    # Schema ko JSON file ya HTML snippet ke taur par save karne ka logic
    os.makedirs("schemas", exist_ok=True)
    with open(f"schemas/{game['slug']}_schema.json", "w") as f:
        json.dump(schema, f, indent=4)

print("SEO Schema Markup generated successfully!")
