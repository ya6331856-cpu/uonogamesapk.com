export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (path === '/sitemap.xml') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      // Render backend ke sitemap ko HTTP se fetch karein taaki SSL error na aaye aur server jaga rahe
      const backendRes = await fetch('http://uonogamesapk.com-iou6.onrender.com/api/sitemap.xml', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (backendRes.ok) {
        const xmlText = await backendRes.text();
        return new Response(xmlText, {
          headers: {
            'Content-Type': 'application/xml; charset=UTF-8',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
    } catch (err) {}

    // Fallback agar koi emergency ho
    const today = new Date().toISOString().split('T')[0];
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://newyono.games/</loc><lastmod>${today}</lastmod></url>
</urlset>`;
    return new Response(fallbackXml, {
      headers: { 'Content-Type': 'application/xml; charset=UTF-8' }
    });
  }

  const response = await context.next();
  if (path.startsWith('/static/') || path.includes('.')) {
    return response;
  }

  const slug = path.split('/').filter(Boolean).pop();
  if (!slug || slug === 'apps') return response;

  let title = slug.replace(/-/g, ' ').toUpperCase() + ' - YONO GAMES';
  try {
    const apiRes = await fetch(`https://uonogamesapk.com-iou6.onrender.com/api/seo/${slug}`);
    if (apiRes.ok) {
      const seoData = await apiRes.json();
      if (seoData.title) title = seoData.title;
    }
  } catch (err) {}

  return new HTMLRewriter()
    .on('title', {
      element(el) { el.setInnerContent(title); }
    })
    .transform(response);
}
