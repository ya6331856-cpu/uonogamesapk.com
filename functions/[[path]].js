export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;
  const response = await context.next();

  // Static files ko ignore karein
  if (path.startsWith('/static/') || path.includes('.')) {
    return response;
  }

  const slug = path.split('/').filter(Boolean).pop();
  if (!slug || slug === 'apps') return response;

  // 🚀 FALLBACK DATA: Agar backend API fail ho jaye, toh yeh automatic data daal dega taaki Soft 404 KABHI na aaye
  let title = slug.replace(/-/g, ' ').toUpperCase() + ' - YONO GAMES';
  let description = `Download and play ${slug.replace(/-/g, ' ')} on India's most trusted gaming platform. Play and win real cash!`;

  try {
    // Backend se real SEO data mangwao
    const apiRes = await fetch(`https://uonogamesapk-com-iau6.onrender.com/api/seo/${slug}`);
    if (apiRes.ok) {
      const seoData = await apiRes.json();
      if (seoData.title) title = seoData.title;
      if (seoData.description) description = seoData.description;
    }
  } catch (err) {
    // Agar API band ho ya data na mile, toh code crash na ho
    console.log('API failed, using fallback data');
  }

  // HTMLRewriter ab HAMESHA chalega, chahe API chale ya fail ho!
  return new HTMLRewriter()
    .on('title', {
      element(el) { el.setInnerContent(title); }
    })
    .on('body', {
      element(el) {
        el.prepend(`<div id="seo-content" style="opacity: 0.01; position: absolute; z-index: -1;"><h1>${title}</h1><p>${description}</p></div>`, { html: true });
      }
    })
    .transform(response);
}
