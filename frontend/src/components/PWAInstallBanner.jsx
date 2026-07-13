import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import RippleButton from "@/components/RippleButton";

const DISMISS_KEY = "pwa_install_dismissed_at";
const DISMISS_TTL_DAYS = 7;

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const daysSince = (Date.now() - Number(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_TTL_DAYS) return;
    }
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(() => {});
    setDeferredPrompt(null);
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  if (!visible) return null;

  return (
    <div
      data-testid="pwa-install-banner"
      className="fixed inset-x-0 bottom-3 z-40 mx-auto max-w-[440px] px-3"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-[#FFE082] bg-gradient-to-br from-[#FFF8E1] to-white px-3 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFC107] to-[#FF9800]">
          <Download className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[13px] font-bold text-[#111]">Install Uonogamesapk</p>
          <p className="truncate text-[11px] text-[#666]">Add to Home Screen for a faster experience</p>
        </div>
        <RippleButton
          onClick={install}
          data-testid="pwa-install-btn"
          className="rounded-full bg-[#111] px-3 py-1.5 text-xs font-bold text-white"
        >
          Install
        </RippleButton>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          data-testid="pwa-dismiss-btn"
          className="flex h-7 w-7 items-center justify-center rounded-full text-[#666] hover:bg-black/5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
