export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Real games database for instant 0-second loading
  const appsData = [
    { id: "mbm-bet", name: "MBM Bet", slug: "mbm-bet", rating: 4.8, downloads: "500K+", bonus: "501", min_withdrawal: "100", icon_url: "/static/icons/mbm-bet.png" },
    { id: "rummy-ludo", name: "Rummy Ludo", slug: "rummy-ludo", rating: 4.8, downloads: "500K+", bonus: "501", min_withdrawal: "100", icon_url: "/static/icons/rummy-ludo.png" },
    { id: "ind-rummy", name: "Ind Rummy", slug: "ind-rummy", rating: 4.8, downloads: "300K+", bonus: "250", min_withdrawal: "100", icon_url: "/static/icons/ind-rummy.png" },
    { id: "gold-rummy", name: "Gold Rummy", slug: "gold-rummy", rating: 4.8, downloads: "300K+", bonus: "250", min_withdrawal: "100", icon_url: "/static/icons/gold-rummy.png" },
    { id: "rummy-888", name: "Rummy 888", slug: "rummy-888", rating: 4.7, downloads: "200K+", bonus: "100", min_withdrawal: "100", icon_url: "/static/icons/rummy-888.png" },
    { id: "rummy-91", name: "Rummy 91", slug: "rummy-91", rating: 4.7, downloads: "200K+", bonus: "100", min_withdrawal: "100", icon_url: "/static/icons/rummy-91.png" },
    { id: "all-yono-games", name: "All Yono Games", slug: "all-yono-games", rating: 4.9, downloads: "1M+", bonus: "1000", min_withdrawal: "100", icon_url: "/static/icons/all-yono-games.png" },
    { id: "yono-rummy", name: "Yono Rummy", slug: "yono-rummy", rating: 4.8, downloads: "800K+", bonus: "500", min_withdrawal: "100", icon_url: "/static/icons/yono-rummy.png" },
    { id: "yono-slots", name: "Yono Slots", slug: "yono-slots", rating: 4.8, downloads: "700K+", bonus: "500", min_withdrawal: "100", icon_url: "/static/icons/yono-slots.png" },
    { id: "teen-patti", name: "Teen Patti", slug: "teen-patti", rating: 4.7, downloads: "600K+", bonus: "200", min_withdrawal: "100", icon_url: "/static/icons/teen-patti.png" },
    { id: "dragon-tiger", name: "Dragon Tiger", slug: "dragon-tiger", rating: 4.6, downloads: "400K+", bonus: "150", min_withdrawal: "100", icon_url: "/static/icons/dragon-tiger.png" },
    { id: "7-up-down", name: "7 Up Down", slug: "7-up-down", rating: 4.6, downloads: "300K+", bonus: "100", min_withdrawal: "100", icon_url: "/static/icons/7-up-down.png" },
    { id: "car-roulette", name: "Car Roulette", slug: "car-roulette", rating: 4.7, downloads: "450K+", bonus: "200", min_withdrawal: "100", icon_url: "/static/icons/car-roulette.png" },
    { id: "zoo-roulette", name: "Zoo Roulette", slug: "zoo-roulette", rating: 4.6, downloads: "350K+", bonus: "150", min_withdrawal: "100", icon_url: "/static/icons/zoo-roulette.png" },
    { id: "jhandi-munda", name: "Jhandi Munda", slug: "jhandi-munda", rating: 4.7, downloads: "400K+", bonus: "200", min_withdrawal: "100", icon_url: "/static/icons/jhandi-munda.png" },
    { id: "red-and-black", name: "Red and Black", slug: "red-and-black", rating: 4.5, downloads: "250K+", bonus: "100", min_withdrawal: "100", icon_url: "/static/icons/red-and-black.png" },
    { id: "best-rummy", name: "Best Rummy", slug: "best-rummy", rating: 4.8, downloads: "500K+", bonus: "300", min_withdrawal: "100", icon_url: "/static/icons/best-rummy.png" },
    { id: "yono-arcade", name: "Yono Arcade", slug: "yono-arcade", rating: 4.9, downloads: "900K+", bonus: "777", min_withdrawal: "100", icon_url: "/static/icons/yono-arcade.png" },
    { id: "yono-vip", name: "Yono VIP", slug: "yono-vip", rating: 4.9, downloads: "800K+", bonus: "1000", min_withdrawal: "100", icon_url: "/static/icons/yono-vip.png" },
    { id: "yono-777", name: "Yono 777", slug: "yono-777", rating: 4.8, downloads: "600K+", bonus: "777", min_withdrawal: "100", icon_url: "/static/icons/yono-777.png" }
  ];

  // Sitemap XML
  if (path === '/sitemap.xml') {
    const today = new Date().toISOString().split('T')[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
    xml += `  <url><loc>https://newyono.games/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;

    for (const app of appsData) {
      xml += `  <url><loc>https://newyono.games/${app.slug}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    }
    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  }

  // Instant API intercept with trailing slash & query support
  if (path.startsWith('/api/apps')) {
    return new Response(JSON.stringify({ success: true, apps: appsData }), {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  }

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
