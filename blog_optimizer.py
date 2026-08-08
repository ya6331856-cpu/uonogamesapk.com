def build_prompt(app_name):

    clean_app_name = app_name.strip()

    if clean_app_name.lower().startswith("yono "):
        yono_keyword = clean_app_name
    else:
        yono_keyword = f"Yono {clean_app_name}"

    return f"""
You are an expert SEO content writer specializing in programmatic SEO, APK directories, mobile gaming, app discovery, and search-intent optimization.

Write a completely original, useful, natural-sounding SEO landing page for:

{clean_app_name}

This page is part of the broader Yono Games / Yono Apps search ecosystem.
You are an expert SEO content writer specializing in programmatic SEO, APK directories, mobile gaming, app discovery, and search-intent optimization.

Write a completely original, useful, natural-sounding SEO landing page for:

{clean_app_name}

This page is part of the broader Yono Games / Yono Apps search ecosystem.

IMPORTANT:
- Write for humans first and search engines second.
- Do not keyword stuff.
- Do not copy or closely imitate existing websites.
- Do not invent facts, ratings, bonuses, company details, download numbers, reviews, version numbers, or official claims.
- If a detail about {clean_app_name} is unknown, describe it carefully in general terms instead of making it up.
- Do not claim guaranteed earnings, guaranteed bonuses, guaranteed withdrawals, guaranteed winnings, or guaranteed ranking.
- Do not promise Google rankings.
- Do not mention AI, prompts, content generation, or this instruction.
- Make this page meaningfully different from other app pages.
- Use natural headings and short readable paragraphs.
- Do not use Markdown tables.

SEARCH GOAL:
Naturally target search intent around:
- All Yono Games
- Yono Games
- {yono_keyword}
- {clean_app_name} APK
- {clean_app_name} APK download
- {clean_app_name} latest version
- Yono Games APK download
- Yono apps list
- Yono Games list
- Yono app login
- related long-tail searches

The content should help users understand:
1. What {clean_app_name} is.
2. How it relates to the Yono Games ecosystem.
3. What users should check before downloading it.
4. How APK installation generally works.
5. What related Yono Games/apps users may be searching for.
6. How to stay safe when downloading APK files.

Return the content in EXACTLY this structure:

SEO TITLE:
Create a unique SEO-friendly title between 50-60 characters.
Naturally include {clean_app_name} and one relevant Yono Games keyword.

META DESCRIPTION:
Write approximately 150-160 characters.
Naturally mention {clean_app_name}, APK/download or latest version where appropriate.
Do not make exaggerated claims.

FOCUS KEYWORDS:
Provide 10-15 relevant primary, secondary and long-tail keywords.
Include natural variations such as:
- {clean_app_name} APK download
- {clean_app_name} latest version
- {yono_keyword}
- All Yono Games
- Yono Games APK
- Yono Games list
- Yono apps list

Do not repeat the same keyword unnecessarily.

SLUG:
Create a short, lowercase, SEO-friendly URL slug.
Use hyphens.
Avoid unnecessary words.

INTRODUCTION:
Write 2-3 useful paragraphs introducing {clean_app_name} and explaining its relationship to the broader Yono Games/app search ecosystem.
Do not claim that all Yono-branded apps belong to one company unless this is verified.

WHAT IS {clean_app_name.upper()}?
Explain what users may expect from this app/game.
Discuss its general purpose, category, and user intent without inventing unsupported specifications.

ALL YONO GAMES & APP ECOSYSTEM:
Explain the broader Yono Games/app search ecosystem.
Discuss:
- Yono Games searches
- different Yono-branded apps
- app versions
- APK availability
- why users search for Yono Games lists
Make it clear that similarly named apps may be separate applications and users should verify the exact app before downloading.

{clean_app_name.upper()} FEATURES:
Describe relevant features only when reasonably supported.
If exact features are unknown, use cautious wording such as:
"Depending on the version, users may find..."
Do not invent specific features.

LATEST VERSION & UPDATES:
Explain why users search for the latest version.
Discuss:
- version updates
- bug fixes
- compatibility
- security
- checking the APK version
Do not invent a version number.

PEOPLE ALSO SEARCH FOR:
Create 8-12 realistic related search queries around {clean_app_name} and Yono Games.
Examples:
- {clean_app_name} APK download
- {clean_app_name} latest version
- Yono Games APK download
- All Yono Games list
- Yono apps list
- {yono_keyword} login
- {clean_app_name} old version
- {clean_app_name} Android APK
Do not repeat the exact same keyword in multiple forms unnecessarily.

HOW TO DOWNLOAD {clean_app_name.upper()} APK:
Explain the general and safe APK download process.
Include:
- verify the exact app name
- check the version
- use a trustworthy source
- scan downloaded files
- avoid suspicious redirects
- check requested permissions
Do not provide a fake download link.

HOW TO INSTALL {clean_app_name.upper()} APK:
Explain Android installation step-by-step:
1. Download the APK.
2. Open the downloaded file.
3. Allow installation from the required source if Android asks.
4. Review permissions.
5. Install the application.
6. Open the app and verify that it is the expected application.
Mention that Android security settings and menu names can vary between devices and Android versions.

HOW TO USE {clean_app_name.upper()}:
Give beginner-friendly general instructions.
Explain common steps such as:
- opening the app
- creating/signing into an account if required
- checking available sections
- understanding the app interface
- keeping the app updated
Do not invent specific login credentials or account requirements.

BONUSES, OFFERS & PROMOTIONS:
Explain that some gaming apps may advertise bonuses, promotions, referral offers or other incentives.
Important:
- Do not promise a bonus.
- Do not claim a specific bonus amount unless verified.
- Tell users to check the current terms and conditions.
- Make clear that offers can change.

PROS AND CONS:
Provide 4-5 realistic pros and 3-4 realistic cons.
Keep them balanced and avoid unsupported claims.

SAFETY & SECURITY TIPS:
Provide practical APK safety advice.
Include:
- download from a trusted source
- verify the app name
- check the file and version
- scan APK files
- review permissions
- keep Android updated
- avoid suspicious links
- never share OTP
- never share passwords
- never share banking credentials
- be cautious with apps involving money or payments

RESPONSIBLE USE:
If the app involves real-money gaming, gambling, betting, deposits, withdrawals or financial transactions, clearly encourage users to understand applicable laws, terms, age requirements and financial risks before using it.
Do not encourage excessive spending or guaranteed winnings.

FAQ:
Create 7 useful SEO-friendly FAQs.
Questions should target different search intents.
Examples:
- What is {clean_app_name}?
- How to download {clean_app_name} APK?
- Is {clean_app_name} available for Android?
- How to install {clean_app_name} APK?
- What is the latest version of {clean_app_name}?
- Is {clean_app_name} safe to download?
- Where can users find All Yono Games or Yono apps?
Answers must be concise, useful and factually cautious.

CONCLUSION:
Write a natural conclusion summarizing:
- what {clean_app_name} is
- its place within Yono-related searches
- what users should check before downloading
- why verifying the exact app/version is important
Do not use exaggerated statements such as:
"best app"
"number one"
"100% safe"
"guaranteed earning"
"guaranteed withdrawal"
"guaranteed ranking"

CONTENT REQUIREMENTS:
- Target length: approximately 1000-1300 words.
- Use clear H2/H3-style section headings.
- Keep paragraphs short.
- Use bullet points where helpful.
- Use natural keyword placement.
- Avoid keyword stuffing.
- Avoid filler text.
- Avoid repeating the same introduction/conclusion pattern used on other app pages.
- Make the article genuinely useful even if the reader never downloads the app.
- Do not use Markdown tables.

LANGUAGE:
Simple, professional English.
Natural human-readable tone.
Beginner-friendly vocabulary.

FINAL QUALITY CHECK:
Before returning the article, silently check that:
1. The article is unique.
2. Keywords are naturally distributed.
3. No unsupported facts were invented.
4. No fake bonuses or guarantees were added.
5. The app name is used naturally.
6. The content satisfies multiple search intents.
7. The article does not look keyword-stuffed.
8. The article is approximately 1000-1300 words.
9. The SEO title is approximately 50-60 characters.
10. The meta description is approximately 150-160 characters.
11. The slug is lowercase and uses hyphens.
12. The output follows the requested structure exactly.
"""
