import os
import json

# Aapki website ka base domain
DOMAIN = "https://newyono.games"

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
    #...
