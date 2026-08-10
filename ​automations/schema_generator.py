import json
import os

def run():
    print("Generating advanced Software Application Schemas for UonoGamesAPK...")
    
    # Aap yahan apne APKs aur Games ki list maintain kar sakte hain
    apps = [
        {
            "name": "Uono Games App",
            "url": "https://www.uonogamesapk.com/",
            "version": "2.1.0",
            "category": "GameApplication",
            "desc": "Download the official Uono Games APK for Android with latest features and smooth gameplay."
        },
        {
            "name": "Uono APK Manager",
            "url": "https://www.uonogamesapk.com/apps-manager",
            "version": "1.5.0",
            "category": "UtilitiesApplication",
            "desc": "Manage and update your Android applications seamlessly with Uono APK Manager."
        }
    ]

    os.makedirs("public/schemas", exist_ok=True)
    generated_count = 0

    for app in apps:
        schema = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": app["name"],
            "operatingSystem": "ANDROID",
            "applicationCategory": app["category"],
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
                "ratingCount": "1420"
            }
        }
        
        schema_json = json.dumps(schema, indent=4)
        filename = f"public/schemas/{app['name'].lower().replace(' ', '_')}_schema.json"
        
        with open(filename, "w") as f:
            f.write(schema_json)
        generated_count += 1
            
    return f"Successfully generated {generated_count} advanced Software Schemas!"

if __name__ == "__main__":
    run()
