import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { resolveUrl } from "@/lib/api";

const SITE_URL = "https://uonogamesapk.com";
const SITE_NAME = "YONO GAMES";
const DEFAULT_OG = `${SITE_URL}/logo-v2.png`;

function absUrl(u) {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  return resolveUrl(u);
}

/**
 * Remove duplicate/conflicting meta/link tags NOT managed by react-helmet-async
 * (e.g. those injected by third-party scripts before mount). Called once per
 * render pass; Helmet-managed tags carry an `x-file-name="SEOHead"` marker in
 * this project's build so we keep those.
 */
function cleanupDuplicates() {
  if (typeof document === "undefined") return;
  // Deduplicate <title> — keep the last one that was set by our SEOHead
  const titles = Array.from(document.querySelectorAll("title"));
  if (titles.length > 1) {
    const helmetTitle = titles.find(
      (t) => t.hasAttribute("x-file-name") || t.hasAttribute("data-rh")
    );
    titles.forEach((t) => {
      if (t !== helmetTitle) t.remove();
    });
  }
  const selectors = [
    'meta[property^="og:"]',
    'meta[name^="twitter:"]',
    'meta[name="description"]',
    'meta[name="keywords"]',
    'meta[name="robots"]',
    'meta[name="googlebot"]',
    'link[rel="canonical"]',
  ];
  const seenByKey = new Map();
  document.querySelectorAll(selectors.join(",")).forEach((el) => {
    const key =
      el.getAttribute("property") ||
      el.getAttribute("name") ||
      (el.rel && el.rel.toLowerCase());
    if (!key) return;
    const isHelmet = el.hasAttribute("x-file-name") || el.hasAttribute("data-rh");
    const prev = seenByKey.get(key);
    if (!prev) {
      seenByKey.set(key, { el, isHelmet });
      return;
    }
    // Keep the Helmet-managed one; remove the other
    if (isHelmet && !prev.isHelmet) {
      prev.el.remove();
      seenByKey.set(key, { el, isHelmet });
    } else if (!isHelmet && prev.isHelmet) {
      el.remove();
    } else {
      // both same source → remove the older duplicate
      prev.el.remove();
      seenByKey.set(key, { el, isHelmet });
    }
  });
}

/**
 * SEOHead - Unified SEO/meta tag component for every page.
 * Emits: title, description, keywords, canonical, robots, OG, Twitter, JSON-LD (SoftwareApplication + BreadcrumbList + FAQPage).
 */
export default function SEOHead({
  type = "website",           // "app" or "website"
  title,
  description,
  keywords,
  canonical,                    // full URL
  image,                        // og image (absolute or /path)
  noindex = false,
  app,                          // full app object for JSON-LD SoftwareApplication
  breadcrumbs,                  // [{name, url}]
  faqItems,                     // [{question, answer}]
}) {
  const canonicalUrl = canonical || (typeof window !== "undefined" ? window.location.href : SITE_URL);
  const ogImage = absUrl(image) || DEFAULT_OG;
  const robots = noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1";

  // Remove duplicate meta/link tags injected by third-party scripts so Google
  // sees a single canonical/OG/description per page.
  useEffect(() => {
    cleanupDuplicates();
    const timers = [50, 250, 800, 2000, 4000].map((ms) =>
      setTimeout(cleanupDuplicates, ms)
    );
    return () => timers.forEach(clearTimeout);
  }, [canonicalUrl, title, description, ogImage, robots]);

  const jsonLd = [];

  if (app) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: app.name,
      operatingSystem: "ANDROID",
      applicationCategory: "GameApplication",
      description: app.description || description || "",
      image: absUrl(app.icon_url) || ogImage,
      url: canonicalUrl,
      softwareVersion: app.version || "",
      fileSize: app.size || "",
      downloadUrl: canonicalUrl,
      author: { "@type": "Organization", name: app.developer || SITE_NAME },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      aggregateRating: app.rating
        ? {
            "@type": "AggregateRating",
            ratingValue: String(app.rating),
            ratingCount: String(Math.max(app.downloads || 100, 100)),
            bestRating: "5",
            worstRating: "1",
          }
        : undefined,
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    });
  }

  if (breadcrumbs && breadcrumbs.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: b.url,
      })),
    });
  }

  if (faqItems && faqItems.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description || ""} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type === "app" ? "product" : "website"} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description || ""} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description || ""} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />

      {/* JSON-LD structured data */}
      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
