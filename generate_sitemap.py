import os
from datetime import datetime

# Apni website ka base URL yahan daalein
BASE_URL = "https://www.uonogamesapk.com"
# Pages ki list (aap isse aur add kar sakte hain)
PAGES = ["/", "/about", "/contact", "/privacy-policy"] 

def generate_sitemap():
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    for page in PAGES:
        sitemap += '  <url>\n'
        sitemap += f'    <loc>{BASE_URL}{page}</loc>\n'
        sitemap += f'    <lastmod>{today}</lastmod>\n'
        sitemap += '    <changefreq>daily</changefreq>\n'
        sitemap += '    <priority>0.8</priority>\n'
        sitemap += '  </url>\n'
        
    sitemap += '</urlset>'
    
    with open("sitemap.xml", "w") as f:
        f.write(sitemap)
    print("Sitemap generated successfully!")

if __name__ == "__main__":
    generate_sitemap()
