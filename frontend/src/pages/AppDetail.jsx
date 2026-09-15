import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Star, Download, BadgeCheck, Gift, ArrowLeft, ShieldCheck, Zap, Users } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import RippleButton from "@/components/RippleButton";
import { resolveUrl } from "@/lib/api";
import { formatCount } from "@/lib/format";

export default function AppDetail({ apps = [], onDownload }) {
  const { slug, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // State initialization from router location state or fallback search from apps list
  const [app, setApp] = useState(location.state?.app || null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!app && apps.length > 0) {
      const found = apps.find(
        (item) => item.slug === slug || String(item.id) === String(id)
      );
      if (found) setApp(found);
    }
  }, [slug, id, apps, app]);

  if (!app) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <SEOHead title="App Not Found" description="The requested Yono game could not be found." noindex={true} />
        <h2 className="text-xl font-bold text-gray-800">Game Not Found</h2>
        <p className="mt-2 text-sm text-gray-600">The game you are looking for might have been removed or updated.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 flex items-center gap-2 rounded-full bg-[#FFC107] px-6 py-2.5 text-sm font-semibold text-[#111111] shadow-md"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>
      </div>
    );
  }

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: app.name, url: `/${app.slug || `app/${app.id}`}` }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-16">
      {/* SEO Head with dynamic SoftwareApplication & AggregateRating Schema */}
      <SEOHead
        title={`${app.name} APK Download - Sign up Bonus ₹${app.signup_bonus || "500"}`}
        description={`Download ${app.name} latest version free on New Yono. Get instant bonus up to ${app.signup_bonus || "500"}, safe verification, and fast withdrawals.`}
        image={app.icon_url}
        canonical={`/${app.slug || `app/${app.id}`}`}
        app={app}
        breadcrumbs={breadcrumbs}
        keywords={`${app.name}, yono games, rummy apk download, money earning app, ${app.name} sign up bonus`}
      />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-black"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
        <h1 className="truncate px-2 font-display text-base font-bold text-gray-900">{app.name}</h1>
        <div className="w-12"></div> {/* Spacer for symmetry */}
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-2xl px-4 pt-6">
        {/* Hero Card */}
        <div className="flex flex-col items-center rounded-[24px] border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="relative">
            <img
              src={resolveUrl(app.icon_url)}
              alt={app.name}
              className="h-24 w-24 rounded-[22px] object-cover shadow-md ring-1 ring-black/5"
            />
            {app.verified && (
              <span className="absolute -bottom-2 -right-2 flex items-center justify-center rounded-full bg-green-500 p-1 text-white shadow" title="Verified Safe">
                <BadgeCheck className="h-4 w-4" />
              </span>
            )}
          </div>

          <h2 className="mt-4 font-display text-2xl font-bold text-gray-900">{app.name}</h2>
          <p className="mt-1 text-xs text-gray-500">Version {app.version || "1.0"} • {app.size || "45 MB"}</p>

          {/* Rating & Active Players */}
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-full bg-[#FFF8E1] px-3 py-1">
              <Star className="h-4 w-4 fill-[#FFC107] text-[#FFC107]" />
              <span className="text-sm font-bold text-gray-900">{app.rating?.toFixed(1) || "4.8"}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
              <Users className="h-4 w-4 text-gray-400" />
              <span>{(app.downloads ? (app.downloads * 8).toLocaleString() : "350.4K")} Active Players</span>
            </div>
          </div>

          {/* Download CTA Button */}
          <div className="mt-6 w-full">
            <RippleButton
              onClick={() => onDownload(app)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFC107] py-4 text-base font-bold text-[#111111] shadow-[0_8px_20px_rgba(255,193,7,0.4)] hover:bg-[#FFB300]"
            >
              <Download className="h-5 w-5" /> Download Safe APK ({app.size || "45 MB"})
            </RippleButton>
          </div>
        </div>

        {/* Bonus & Withdrawal Highlights */}
        {(app.signup_bonus || app.min_withdraw) && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {app.signup_bonus && (
              <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                <div className="rounded-xl bg-amber-500 p-2.5 text-white shadow-sm">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Sign Up Bonus</p>
                  <p className="text-base font-extrabold text-gray-900">₹{app.signup_bonus}</p>
                </div>
              </div>
            )}
            {app.min_withdraw && (
              <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
                <div className="rounded-xl bg-green-600 p-2.5 text-white shadow-sm">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-green-700">Min Withdrawal</p>
                  <p className="text-base font-extrabold text-gray-900">₹{app.min_withdraw}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Trust Badges Section */}
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900">Why Download from New Yono?</h3>
          <div className="mt-3 space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">100% Virus-Free APK</p>
                <p className="text-[11px] text-gray-500">Scanned and verified for secure installation on all Android versions.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="mt-0.5 h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">Instant Bank Withdrawals</p>
                <p className="text-[11px] text-gray-500">Transfer your winnings directly to UPI or Bank Account within seconds.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description / SEO Content Section */}
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900">About {app.name}</h3>
          <p className="mt-2 text-xs leading-relaxed text-gray-600">
            {app.description || `Play ${app.name} on New Yono platform. Enjoy smooth gameplay, high winning multipliers, daily rewards, and exciting tournaments. Download the official APK now and claim your joining bonus instantly.`}
          </p>
        </div>
      </main>
    </div>
  );
}
