import axios from 'axios';

export default async function handler(req, res) {
  const sitemapUrl = 'https://www.newyono.games/sitemap.xml';
  
  // Google aur Bing ke official ping endpoints
  const googlePing = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
  const bingPing = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

  try {
    // Dono search engines ko ping request bhejna
    await Promise.all([
      axios.get(googlePing),
      axios.get(bingPing)
    ]);

    return res.status(200).json({ success: true, message: "Sitemap successfully pinged to Google and Bing!" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
