export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (path === '/sitemap.xml') {
    const today = new Date().toISOString().split('T')[0];
    
    // Complete list of all games for instant SEO indexing without Render SSL bottlenecks
    const games = [
      "rummy-ludo", "ind-rummy", "gold-rummy", "rummy-888", "rummy-91", 
      "all-yono-games", "yono-rummy", "yono-slots", "teen-patti", "dragon-tiger",
      "7-up-down", "car-roulette", "zoo-roulette", "jhandi-munda", "red-and-black",
      "best-rummy", "yono-arcade", "yono-vip", "yono-777", "teen-patti-gold",
      "andar-bahar", "fruit-line", "mines", "crash", "plinko",
      "dice", "wheel", "limbo", "tower", "keno",
      "blackjack", "baccarat", "roulette", "poker", "teen-patti-joy",
      "teen-patti-star", "rummy-culture", "rummy-circle", "mpl-rummy", "adda52",
      "pocket52", "junglee-rummy", "gameturf", "speed-rummy", "royal-rummy",
      "mega-rummy", "super-rummy", "pro-rummy", "master-rummy", "grand-rummy",
      "king-rummy", "queen-rummy", "jack-rummy", "ace-rummy", "lucky-rummy",
      "gold-teen-patti", "silver-teen-patti", "bronze-teen-patti", "diamond-teen-patti", "platinum-teen-patti",
      "vip-teen-patti", "turbo-teen-patti", "flash-teen-patti", "blitz-teen-patti", "express-teen-patti",
      "classic-rummy", "modern-rummy", "desi-rummy", "indian-rummy", "bharat-rummy",
      "yono-slots-winner", "yono-spin", "yono-jackpot", "yono-cash", "yono-win"
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
    
    // Main website URL
    xml += `  <url><loc>https://newyono.games/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;

    // All game URLs
    for (const slug of games) {
      const loc = `https://newyono.games/${slug}`;
      xml += `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8',
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
