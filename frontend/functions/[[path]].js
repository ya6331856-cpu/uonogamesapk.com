export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // 1. Normal React ki index.html file fetch karo
  const response = await context.next();

  // 2. Static files (images, css, js) par SEO inject nahi karna hai
  if (path.startsWith('/static/') || path.includes('.')) {
    return response;
  }

  // 3. URL se app ka slug nikalo
  const slug = path.split('/').filter(Boolean).pop();

  // Agar home page hai, toh wapas normal page bhej do
  if (!slug || slug === 'apps') return response;

  try {
    // 4. Render backend se SEO data fetch karo
    const apiRes = await fetch(`https://uonogamesapk-com-iau6.onrender.com/api/seo/${slug}`);

    if (apiRes.ok) {
      const seoData = await apiRes.json();

      // 5. Cloudflare HTMLRewriter se HTML mein SEO tags inject karo
      return new HTMLRewriter()
        .on('title', {
          element(el) { el.setInnerContent(seoData.title || 'YONO GAMES'); }
        })
        .on('head', {
          element(el) {
            if (seoData.description) el.append(`<meta name="description" content="${seoData.description}">`, { html: true });
            if (seoData.image) el.append(`<meta property="og:image" content="${seoData.image}">`, { html: true });
            if (seoData.keywords) el.append(`<meta name="keywords" content="${seoData.keywords}">`, { html: true });
          }
        })
        .on('body', {
          element(el) {
            // display:none HATA DIYA HAI. Googlebot ab ise turant padh lega aur Soft 404 nahi dega.
            el.prepend(`<div id="seo-content" style="opacity: 0.01; position: absolute; z-index: -1;"><h1>${seoData.title}</h1><p>${seoData.description}</p></div>`, { html: true });
          }
        })
        .transform(response);
    }
  } catch (err) {
    // Agar API fail ho jaye, toh bina tode normal page load karwa do
    return response;
  }

  return response;
}
