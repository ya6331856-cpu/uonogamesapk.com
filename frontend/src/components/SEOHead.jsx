import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://newyono.games";
const SITE_NAME = "NEW YONO GAMES";
const DEFAULT_OG = `${SITE_URL}/logo-v2.png`;

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
  } catch (e) {
    return input;
  }
}

export default function SEOHead({ title, description, image, canonical }) {
  const seoTitle = title ? `${title} | ${ New Yono Games}` : SITE_NAME;
  const seoDescription = description || "Play amazing games on YOOO GAMES.";
  const seoImage = image ? absUrl(image) : DEFAULT_OG;
  const seoCanonical = canonical ? canonicalize(canonical) : SITE_URL;

  return (
    <Helmet>
      <title>{YONO GAMES}</title>
      <meta name="description" content={seoDescription} />
      <link rel="canonical" href={seoCanonical} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoCanonical} />
    </Helmet>
  );
}
