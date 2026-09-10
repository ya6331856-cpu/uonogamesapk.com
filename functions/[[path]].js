export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (path === '/sitemap.xml') {
    try {
      // Timeout handle karne ke liye fetch par race condition lagayein
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

      const apiRes = await fetch('https://uonogamesapk.com-iou6.onrender.com/api/apps?include_hidden=false', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      let apps = [];
      if (apiRes.ok) {
        const data = await apiRes.json();
        apps = data.apps || [];
      }

      const today = new Date().toISOString().split('T')[0];
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
      
      // Main website URL
      xml += `  <url><loc>https://newyono.games/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;

      // Agar apps fetch ho gaye hain, toh unhe add karein
      for (const app of apps) {
        const slug = app.slug || app.id;
        if (!slug || app.noindex || app.hidden) continue;

        const loc = `https://newyono.games/${slug}`;
        const lastmod = (app.updated_at || app.created_at || today).split('T')[0];
        
        let imageBlock = '';
        if (app.icon_url) {
          const imgUrl = app.icon_url.startsWith('http') ? app.icon_url : `https://newyono.games${app.icon_url}`;
          imageBlock = `<image:image><image:loc>${imgUrl}</image:loc><image:title>${app.name || ''}</image:title></image:image>`;
        }

        xml += `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority>${imageBlock}</url>\n`;
      }

      xml += `</urlset>`;

      return new Response(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=UTF-8',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } catch (err) {
      // Fallback agar Render backend sone ki wajah se timeout de de
      const today = new Date().toISOString().split('T')[0];
      const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://newyono.games/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
      return new Response(fallbackXml, {
        headers: { 'Content-Type': 'application/xml; charset=UTF-8' }
      });
    }
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
