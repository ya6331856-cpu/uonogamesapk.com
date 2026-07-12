import { useEffect, useRef } from "react";

/**
 * Renders an ad slot when ads are enabled in settings.
 * Supports custom banner HTML or a Google AdSense client id (+ optional slot id).
 * Always shows a labelled placeholder so the slot is visible before ads load.
 */
export const AdSlot = ({ ads }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ads?.enabled && ads?.adsense_client && window.adsbygoogle) {
      try {
        window.adsbygoogle.push({});
      } catch (e) {
        /* noop */
      }
    }
  }, [ads]);

  if (!ads?.enabled) return null;

  if (ads.banner_html) {
    return (
      <div
        data-testid="ad-slot"
        className="overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white"
        dangerouslySetInnerHTML={{ __html: ads.banner_html }}
      />
    );
  }

  if (ads.adsense_client) {
    return (
      <div data-testid="ad-slot" className="relative overflow-hidden rounded-[18px] border border-dashed border-[#E5E7EB] bg-[#F8F9FA]" ref={ref}>
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-[#C4C4C4]">
          Advertisement
        </span>
        <ins
          className="adsbygoogle"
          style={{ display: "block", minHeight: "90px" }}
          data-ad-client={ads.adsense_client}
          {...(ads.adsense_slot ? { "data-ad-slot": ads.adsense_slot } : {})}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return null;
};

export default AdSlot;
