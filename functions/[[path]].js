export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // ==========================================
  // 1. SITEMAP NINJA TRICK (100% Automatic)
  // ==========================================
  // Jab Googlebot sitemap.xml maange, toh seedha Render backend se live data uthao
  if (path === '/sitemap.xml') {
    return fetch('https://uonogamesapk.com-iou6.onrender.com/api/sitemap.xml');
  }

  const response = await context.next();

  // ==========================================
  // 2. STATIC FILES KO IGNORE KAREIN
  // ==========================================
  if (path.startsWith('/static/') || path.includes('.')) {
    return response;
  }

  const slug = path.split('/').filter(Boolean).pop();
  if (!slug || slug === 'apps') return response;

  // ==========================================
  // 3. DYNAMIC SEO DATA FETCH (Optional Fallback)
  // ==========================================
  let title = slug.replace(/-/g, ' ').toUpperCase() + ' - YONO GAMES';

  try {
    const apiRes = await fetch(`https://uonogamesapk.com-iou6.onrender.com/api/seo/${slug}`);
    if (apiRes.ok) {
      const seoData = await apiRes.json();
      if (seoData.title) title = seoData.title;
    }
  } catch (err) {
    console.log('API failed, using fallback data');
  }

  // ==========================================
  // 4. HTML REWRITER (Dynamic Title)
  // ==========================================
  return new HTMLRewriter()
    .on('title', {
      element(el) { el.setInnerContent(title); }
    })
    .transform(response);
}
