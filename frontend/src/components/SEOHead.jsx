import { Helmet } from "react-helmet-async";

const SITE_URL = "https://newyono.games";
const SITE_NAME = "New Yono";
const DEFAULT_OG = `${SITE_URL}/logo-v2.png`;
const FAVICON_URL = "https://newyono.games/api/uploads/e440134c7eaa48ecaaaf0e6103626dca.png";

function absUrl(u) {
  if (!u) return SITE_URL;
  if (u.startsWith("http")) return u;
  return `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`;
}

export function canonicalize(input) {
  if (!input) return SITE_URL;
  try {
    const url = new URL(input, SITE_URL);
    url.hash = "";
    url.search = "";
    let p = url.pathname;
    if (p.length > 1 && p.endsWith("/")) {
      p = p.slice(0, -1);
    }
    url.pathname = p;
    return url.toString();
  } catch (_) {
    return input;
  }
}

export default function SEOHead({ title, description, image, canonical, type = "website", app = null, breadcrumbs = [], noindex = false, keywords = "" }) {
  // Updated high-converting default title and description
  const seoTitle = title ? `${title} | ${SITE_NAME}` : `All Yono Games List 2026 – Download Official APK & Get ₹501 Bonus`;
  const seoDescription = description || "Discover all yono games, Rummy & slots. Download official APK with instant ₹501 bonus, lightning-fast payouts, 100% verified security, and direct UPI withdrawals.";
  const seoImage = image ? absUrl(image) : DEFAULT_OG;
  const seoCanonical = canonical ? canonicalize(canonical) : SITE_URL;

  // Structured Data (JSON-LD) with AggregateRating for Rich Snippets (Google Stars)
  const appSchema = app ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": app.name,
    "operatingSystem": "ANDROID",
    "applicationCategory": "GameApplication",
    "softwareVersion": app.version || "1.0",
    "fileSize": app.size || "50MB",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": app.rating ? app.rating.toString() : "4.8",
      "ratingCount": app.downloads ? Math.floor(app.downloads / 5) : "1250",
      "bestRating": "5",
      "worstRating": "1"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    }
  } : null;

  const breadcrumbSchema = breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((b, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": b.name,
      "item": `${SITE_URL}${b.url}`
    }))
  } : null;

  return (
    <Helmet>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={seoCanonical} />
      
      {/* Favicon & Touch Icons */}
      <link rel="icon" type="image/png" href={FAVICON_URL} />
      <link rel="shortcut icon" href={FAVICON_URL} />
      <link rel="apple-touch-icon" href={FAVICON_URL} />

      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoCanonical} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />

      {/* Structured Data Scripts for Google Crawlers */}
      {appSchema && (
        <script type="application/ld+json">
          {JSON.stringify(appSchema)}
        </script>
      )}

      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
}
