import { useEffect } from "react";
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

export default function SEOHead({ title, description, image, canonical }) {
  const seoTitle = title ? `${title} | ${SITE_NAME} Play & Win` : `${SITE_NAME} - Play & Win`;
  const seoDescription = description || "Play and win real cash on New Yono. Fast, safe & verified downloads.";
  const seoImage = image ? absUrl(image) : DEFAULT_OG;
  const seoCanonical = canonical ? canonicalize(canonical) : SITE_URL;

  return (
    <Helmet>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <link rel="canonical" href={seoCanonical} />
      
      {/* Favicon & Touch Icons */}
      <link rel="icon" type="image/png" href={FAVICON_URL} />
      <link rel="shortcut icon" href={FAVICON_URL} />
      <link rel="apple-touch-icon" href={FAVICON_URL} />

      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoCanonical} />
    </Helmet>
  );
}
