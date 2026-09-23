import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Crown, Sparkles, FileText, Lock, AlertTriangle, Send } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import SiteFooter from "@/components/SiteFooter";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111]">
      <SEOHead 
        title="About NewYono.Games - Official Gaming Directory & SEO Guide 2026" 
        description="Explore comprehensive details about NewYono.Games, official APK downloads, rummy bonuses, privacy guidelines, and agency partnership programs." 
        canonical="https://newyono.games/about"
      />

      <div className="max-w-md mx-auto bg-white min-h-screen shadow-sm flex flex-col">
        {/* TOP BAR */}
        <div className="sticky top-0 z-30 flex items-center justify-between bg-white/95 px-4 py-3 backdrop-blur-md border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#E5E7EB] text-[#111111] shadow-sm hover:bg-[#F1F1F1]">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="font-display text-sm font-bold text-[#111111]">About & SEO Hub</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#22C55E] bg-[#F0FDF4] px-2 py-1 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified
          </span>
        </div>

        {/* MAIN CONTENT CONTAINER */}
        <div className="p-5 space-y-6 flex-1 text-xs text-[#555555] leading-relaxed">
          
          {/* Section 1: Introduction */}
          <div className="space-y-2 bg-[#FFFDF5] border border-[#FFE082] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#B45309] font-bold text-sm">
              <Crown className="h-4 w-4 fill-[#FFC107] text-[#FFC107]" />
              <h2>Welcome to NewYono.Games Official Portal</h2>
            </div>
            <p>
              NewYono.Games is India&apos;s leading independent directory, review platform, and official download hub for top-tier Android gaming applications. Specializing in high-performance real-cash rummy APKs, Teen Patti master editions, slot machine simulators, and multiplayer arcade tournaments, our website connects millions of gaming enthusiasts with verified operators. We focus on absolute security, fast UPI payouts, and guaranteed sign-up bonuses ranging from ₹501 to ₹2501.
            </p>
          </div>

          {/* Section 2: Core Offerings & Features */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Sparkles className="h-4 w-4 text-[#FFC107]" />
              <h3>Why Players Choose NewYono.Games</h3>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[#666]">
              <li><strong>Verified APKs:</strong> Every game hosted or linked undergoes rigorous malware and security screening.</li>
              <div><strong>Instant UPI Withdrawals:</strong> Seamless integration with fast payout banking systems.</div>
              <div><strong>Lucrative Bonuses:</strong> Enjoy exclusive sign-up rewards and daily referral commissions.</div>
              <div><strong>Official Agency Program:</strong> Connect with our network for official partnership opportunities.</div>
            </ul>
          </div>

          {/* Section 3: Targeted Search Keywords & SEO Index */}
          <div className="space-y-2 bg-[#F9FAFB] border border-gray-200 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <FileText className="h-4 w-4 text-[#0284C7]" />
              <h3>Primary Keywords & Search Directory</h3>
            </div>
            <p className="text-[10px] text-[#666]">
              Yono Games download, New Yono Rummy APK, Teen Patti real cash app, Slots spin bonus apps, Yono agency program, online rummy referral commission, instant UPI cash withdrawal games, Android gaming store India, 777 slots apk download, Best rummy app with bonus, Yono partner network official, trusted gaming platform 2026, Teen Patti Gold, Ludo cash winning apps, Dragon Tiger tricks, fast withdrawal rummy apps.
            </p>
          </div>

          {/* Section 4: Privacy Policy & Data Security */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Lock className="h-4 w-4 text-[#16A34A]" />
              <h3>Privacy Policy & Analytics Usage</h3>
            </div>
            <p>
              We prioritize visitor privacy. NewYono.Games utilizes standard tracking and analytics tools including Google Analytics, Google Search Console, and Microsoft Clarity to monitor site performance, traffic trends, and improve user experience. We do not sell or share identifiable personal data with external marketing brokers. All external links connect to encrypted, secure operator domains.
            </p>
          </div>

          {/* Section 5: Disclaimer & DMCA Compliance */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h3>Disclaimer & DMCA Policy</h3>
            </div>
            <p>
              NewYono.Games operates purely as an informational review directory and download aggregator. Real-cash gaming involves financial risk; users must verify local state regulations and be 18+ before participating. We fully comply with the Digital Millennium Copyright Act (DMCA). If you have any copyright concerns, reach out via our official Telegram support channel.
            </p>
          </div>

          {/* Telegram Banner */}
          <div 
            onClick={() => window.open("https://t.me/yonoagencynetworkofficial", "_blank")}
            className="cursor-pointer bg-gradient-to-r from-[#E0F2FE50] to-[#E0F2FE] border border-[#BAE6FD] rounded-2xl p-3.5 flex items-center justify-between shadow-sm hover:shadow transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#0284C7] flex items-center justify-center text-white shadow-sm shrink-0">
                <Send className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-display font-bold text-xs text-[#0369A1]">Official Telegram Network</h4>
                <p className="text-[10px] text-[#0284C7]">Connect for agency & partnership inquiries</p>
              </div>
            </div>
            <span className="bg-[#0284C7] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm">
              Join
            </span>
          </div>

