import os
from bs4 import BeautifulSoup

# 1. Fixed Title aur Favicon URL jo aapne bataya hai
fixed_title = "ALL YONO APK"
favicon_url = "https://www.uonogamesapk.com/api/uploads/253f23946185403b8ef85609ec9b818e.png"

print(f"Setting Title: {fixed_title}")
print(f"Setting Favicon: {favicon_url}")

# 2. index.html file ko read karke update karna
html_file_path = "index.html"
if os.path.exists(html_file_path):
    with open(html_file_path, "r", encoding="utf-8") as file:
        soup = BeautifulSoup(file, "html.parser")

    # Title update karein
    if soup.title:
        soup.title.string = fixed_title
    else:
        new_title_tag = soup.new_tag("title")
        new_title_tag.string = fixed_title
        soup.head.append(new_title_tag)

    # Favicon update karein
    favicon_link = soup.find("link", rel=lambda x: x and 'icon' in x.lower())
    if favicon_link:
        favicon_link["href"] = favicon_url
    else:
        # Agar favicon tag na ho toh naya tag bana dein
        new_favicon = soup.new_tag("link", rel="icon", href=favicon_url, type="image/png")
        soup.head.append(new_favicon)

    # Updated HTML ko wapas save karein
    with open(html_file_path, "w", encoding="utf-8") as file:
        file.write(str(soup))
    
    print("Successfully updated index.html with fixed Title and Favicon!")
else:
    print("index.html file not found in root directory!")
