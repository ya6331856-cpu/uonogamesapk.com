export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // 1. Sitemap Generation with caching
  if (path === '/sitemap.xml') {
    const today = new Date().toISOString().split('T')[0];
    try {
      const apiRes = await fetch('http://uonogamesapk.com-iou6.onrender.com/api/apps?include_hidden=false');
      if (apiRes.ok) {
        const data = await apiRes.json();
        const apps = data.apps || [];
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
        xml += `  <url><loc>https://newyono.games/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
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
      }
    } catch (err) {}

    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://newyono.games/</loc><lastmod>${today}</lastmod></url>
</urlset>`;
    return new Response(fallbackXml, {
      headers: { 'Content-Type': 'application/xml; charset=UTF-8' }
    });
  }

  // 2. Proxy & Cache API requests at Cloudflare Edge for instant loading
  if (path.startsWith('/api/')) {
    const targetUrl = `http://uonogamesapk.com-iou6.onrender.com${path}${url.search}`;
    try {
      const cache = caches.default;
      let response = await cache.match(context.request);
      if (!response) {
        response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Cloudflare-Worker-Proxy',
            'Accept': 'application/json'
          }
        });
        response = new Response(response.body, response);
        // Cache API response at Cloudflare edge for 10 minutes
        response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        context.waitUntil(cache.put(context.request, response.clone()));
      }
      return response;
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 3. Page handling and dynamic titles
  const response = await context.next();
  if (path.startsWith('/static/') || path.includes('.')) {
    return response;
  }

  const slug = path.split('/').filter(Boolean).pop();
  if (!slug || slug === 'apps') return response;

  let title = slug.replace(/-/g, ' ').toUpperCase() + ' - YONO GAMES';

  return new HTMLRewriter()
    .on('title', {
      element(el) { el.setInnerContent(title); }
    })
    .transform(response);
}
