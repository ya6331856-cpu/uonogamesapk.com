import { useEffect, useRef } from "react";

/**
 * Renders an ad slot when ads are enabled in settings.
 * Supports custom banner HTML or a Google AdSense client id.
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
      <div data-testid="ad-slot" className="overflow-hidden rounded-[18px] border border-dashed border-[#E5E7EB] bg-white p-2" ref={ref}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={ads.adsense_client}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return null;
};

export default AdSlot;
