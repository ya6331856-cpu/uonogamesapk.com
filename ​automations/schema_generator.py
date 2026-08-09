import json
import os

def run():
    print("Generating Software Schemas for UonoGamesAPK...")
    
    apps = [
        {
            "name": "Uono Games App",
            "url": "https://www.uonogamesapk.com/",
            "version": "2.1.0",
            "desc": "Download the official Uono Games APK for Android with latest features and smooth gameplay."
        }
    ]

    os.makedirs("public/schemas", exist_ok=True)
    
    for app in apps:
        schema = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": app["name"],
            "operatingSystem": "ANDROID",
            "applicationCategory": "GameApplication",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
            },
            "softwareVersion": app["version"],
            "description": app["desc"],
            "url": app["url"],
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250"
            }
        }
        
        schema_json = json.dumps(schema, indent=4)
        filename = f"public/schemas/{app['name'].lower().replace(' ', '_')}_schema.json"
        with open(filename, "w") as f:
            f.write(schema_json)
            
    return "Schema generated successfully!"

if __name__ == "__main__":
    run()
