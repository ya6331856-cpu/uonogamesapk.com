import { useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";

/**
 * Injects Google Analytics 4, Google Search Console + Bing verification meta tags
 * based on the admin-configured settings.analytics values. Idempotent — safe to
 * mount multiple times.
 */
export default function Analytics() {
  const { settings } = useSettings();
  const a = settings?.analytics || {};

  // Verification meta tags (rendered directly to <head>)
  useEffect(() => {
    const upsert = (name, content) => {
      if (typeof document === "undefined") return null;
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!content) {
        if (el) el.remove();
        return null;
      }
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
      return el;
    };
    upsert("google-site-verification", a.gsc_verification || "");
    upsert("msvalidate.01", a.bing_verification || "");
  }, [a.gsc_verification, a.bing_verification]);

  // GA4 loader
  useEffect(() => {
    const id = (a.ga4_id || "").trim();
    if (!id || typeof document === "undefined") return;
    if (document.querySelector(`script[data-ga4="${id}"]`)) return;
    const s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-ga4", id);
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(s);
    const inline = document.createElement("script");
    inline.setAttribute("data-ga4-init", id);
    inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true});`;
    document.head.appendChild(inline);
  }, [a.ga4_id]);

  return null;
}
