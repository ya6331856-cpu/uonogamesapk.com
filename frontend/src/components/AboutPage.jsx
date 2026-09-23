import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Crown, Sparkles, FileText, Lock, AlertTriangle, Send } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import SiteFooter from "@/components/SiteFooter";

// Adsterra Script Injector Component for Banners & Native Ads
function AdUnit({ scriptUrl, atOptionsConfig }) {
  const adRef = useRef(null);

  useEffect(() => {
    if (!adRef.current) return;
    adRef.current.innerHTML = "";

    if (atOptionsConfig) {
      const scriptOption = document.createElement("script");
      scriptOption.type = "text/javascript";
      scriptOption.text = `atOptions = ${JSON.stringify(atOptionsConfig)};`;
      adRef.current.appendChild(scriptOption);
    }

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = scriptUrl;
    adRef.current.appendChild(script);

    return () => {
      if (adRef.current) adRef.current.innerHTML = "";
    };
  }, [scriptUrl, atOptionsConfig]);

  return <div ref={adRef} className="flex justify-center my-4 overflow-hidden min-h-[250px] bg-[#FAFAFA] rounded-2xl border border-[#E5E7EB]" />;
}

export default function AboutPage() {
  const navigate = useNavigate();

  // Popunder and Social Bar global scripts injection via useEffect
  useEffect(() => {
    const popunderScript = document.createElement("script");
    popunderScript.src = "https://preliminarycultural.com/48/6b/89/486b89ad71c5119a51aff11c2aeaaea7.js";
    popunderScript.async = true;
    document.body.appendChild(popunderScript);

    const socialBarScript = document.createElement("script");
    socialBarScript.src = "https://preliminarycultural.com/cc/28/1a/cc281a7128907feeef362f6ee4df63fc.js";
    socialBarScript.async = true;
    document.body.appendChild(socialBarScript);

    return () => {
      if (popunderScript.parentNode) popunderScript.parentNode.removeChild(popunderScript);
      if (socialBarScript.parentNode) socialBarScript.parentNode.removeChild(socialBarScript);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111]">
      <SEOHead 
        title="About NewYono.Games - Massive Ultimate 20-Headline Mega Gaming Directory & SEO Engine" 
        description="Read our exhaustive, multi-thousand word master encyclopedia covering NewYono.Games, real-cash rummy architectures, Teen Patti mastery, slot mechanics, UPI security, and global agency networks." 
        canonical="https://newyono.games/about"
      />

      <div className="max-w-md mx-auto bg-white min-h-screen shadow-sm flex flex-col">
        {/* TOP BAR */}
        <div className="sticky top-0 z-30 flex items-center justify-between bg-white/95 px-4 py-3 backdrop-blur-md border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#E5E7EB] text-[#111111] shadow-sm hover:bg-[#F1F1F1]">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="font-display text-sm font-bold text-[#111111]">20-Headline Massive SEO Hub</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#22C55E] bg-[#F0FDF4] px-2 py-1 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified Elite
          </span>
        </div>

        {/* MAIN CONTENT CONTAINER WITH 20 MASSIVE HEADLINES AND ADS AFTER EVERY SINGLE HEADLINE */}
        <div className="p-5 space-y-6 flex-1 text-xs text-[#555555] leading-relaxed">
          
          {/* 1 */}
          <div className="space-y-2 bg-[#FFFDF5] border border-[#FFE082] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#B45309] font-bold text-sm">
              <Crown className="h-4 w-4 fill-[#FFC107] text-[#FFC107]" />
              <h2>1. The Definitive Encyclopedia of NewYono.Games: The Apex Standard in Android Gaming Aggregation</h2>
            </div>
            <p>NewYono.Games represents the absolute pinnacle and technological zenith in the evolution of digital content curation, professional application reviews, and secure mobile software distribution across international entertainment landscapes. Our platform connects everyday mobile gaming enthusiasts with official operator networks, offering guaranteed sign-up bonuses ranging dynamically from ₹501 to ₹2501 and lightning-fast local storage caching for maximum performance.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/d31a3f5fa7f858e8634836f93febd15e/invoke.js" />

          {/* 2 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Sparkles className="h-4 w-4 text-[#FFC107]" />
              <h2>2. Exhaustive Architectural Breakdown of Real-Cash Rummy, Teen Patti, and Slot Ecosystems</h2>
            </div>
            <p>The profound transition of traditional card games and table wagering into sophisticated digital applications has completely transformed modern entertainment. Indian Rummy requires strategic arrangement of cards into valid sequences, while Teen Patti master editions deliver accelerated wagering thrills, dynamic blind-and-seen psychological maneuvers, and massive daily tournament structures.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/f017d2f3e907257c8f3369bd4037b28f/invoke.js" atOptionsConfig={{ key: 'f017d2f3e907257c8f3369bd4037b28f', format: 'iframe', height: 250, width: 300, params: {} }} />

          {/* 3 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
              <h2>3. Frictionless Financial Infrastructure: UPI Payout Integration and Security Protocols</h2>
            </div>
            <p>NewYono.Games exclusively highlights applications that have established robust financial infrastructures integrated seamlessly with India&apos;s UPI and automated banking channels. Withdrawals start from ₹100 securely, backed by advanced 256-bit SSL encryption and multi-factor authentication checkpoints.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/d31a3f5fa7f858e8634836f93febd15e/invoke.js" />

          {/* 4 */}
          <div className="space-y-2 bg-[#F9FAFB] border border-gray-200 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <FileText className="h-4 w-4 text-[#0284C7]" />
              <h2>4. Exhaustive Keyword Directory, SEO Architecture, and Metadata Indexing</h2>
            </div>
            <p className="text-[10px] text-[#666] leading-relaxed">Yono Games download, New Yono Rummy APK, Teen Patti real cash app, Slots spin bonus apps, Yono agency program, online rummy referral commission, instant UPI cash withdrawal games, Android gaming store India, 777 slots apk download, Best rummy app with bonus, Yono partner network official, trusted gaming platform 2026, Teen Patti Gold, Ludo cash winning apps, Dragon Tiger tricks, fast withdrawal rummy apps.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/f017d2f3e907257c8f3369bd4037b28f/invoke.js" atOptionsConfig={{ key: 'f017d2f3e907257c8f3369bd4037b28f', format: 'iframe', height: 250, width: 300, params: {} }} />

          {/* 5 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Lock className="h-4 w-4 text-[#16A34A]" />
              <h2>5. Rigorous Privacy Standards and Ethical Data Governance Frameworks</h2>
            </div>
            <p>We deploy enterprise tracking suites including Google Analytics, Search Console, and Microsoft Clarity to monitor performance and optimize user navigation safely without ever selling or sharing identifiable personal data with external marketing brokers or unauthorized advertising syndicates.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/d31a3f5fa7f858e8634836f93febd15e/invoke.js" />

          {/* 6 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <ShieldCheck className="h-4 w-4 text-[#0284C7]" />
              <h2>6. Comprehensive Terms of Service and Risk Disclosures</h2>
            </div>
            <p>Real-cash gaming involves financial risk; participants must be 18+ and verify local state regulations before engaging in skill-based applications. All promotional incentives and sign-up bonus credits are strictly subject to individual operator wagering requirements and turnover thresholds.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/f017d2f3e907257c8f3369bd4037b28f/invoke.js" atOptionsConfig={{ key: 'f017d2f3e907257c8f3369bd4037b28f', format: 'iframe', height: 250, width: 300, params: {} }} />

          {/* 7 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-red-500">
              <AlertTriangle className="h-4 w-4" />
              <h2>7. Strict DMCA Compliance and Intellectual Property Protection</h2>
            </div>
            <p>We operate as an informational directory and do not host pirated files or malicious software on our private servers. All download buttons redirect traffic directly to official, verified operator networks in full compliance with international copyright regulations.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/d31a3f5fa7f858e8634836f93febd15e/invoke.js" />

          {/* 8 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Sparkles className="h-4 w-4 text-[#FFC107]" />
              <h2>8. Advanced Mobile App Performance Optimization and Edge Deployment</h2>
            </div>
            <p>Our deployment infrastructure uses edge-compute capabilities and Cloudflare DNS to ensure server response times remain under 200 milliseconds across high-speed 4G, 5G, and broadband networks in both urban and rural environments throughout India.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/f017d2f3e907257c8f3369bd4037b28f/invoke.js" atOptionsConfig={{ key: 'f017d2f3e907257c8f3369bd4037b28f', format: 'iframe', height: 250, width: 300, params: {} }} />

          {/* 9 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <FileText className="h-4 w-4 text-[#0284C7]" />
              <h2>9. Community Engagement and 24/7 Telegram Support Networks</h2>
            </div>
            <p>We maintain active support channels through our official Telegram network, providing direct updates regarding app releases, bonus drops, tournament schedules, and real-time technical troubleshooting assistance for all active community members.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/d31a3f5fa7f858e8634836f93febd15e/invoke.js" />

          {/* 10 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Crown className="h-4 w-4 text-[#FFC107]" />
              <h2>10. Future Roadmap and Technological Evolution of NewYono.Games</h2>
            </div>
            <p>Our strategic roadmap includes automated APK health monitors, artificial intelligence recommendation engines to suggest personalized game titles, and expanded multi-language localization support to cater to regional gaming audiences across India.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/f017d2f3e907257c8f3369bd4037b28f/invoke.js" atOptionsConfig={{ key: 'f017d2f3e907257c8f3369bd4037b28f', format: 'iframe', height: 250, width: 300, params: {} }} />

          {/* 11 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
              <h2>11. Understanding Wagering Requirements and Bonus Terms</h2>
            </div>
            <p>All sign-up bonuses and promotional cash rewards are governed by specific operator wagering criteria to ensure fair promotional play. Players must carefully review turnover thresholds before initiating cash withdrawals.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/d31a3f5fa7f858e8634836f93febd15e/invoke.js" />

          {/* 12 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Sparkles className="h-4 w-4 text-[#FFC107]" />
              <h2>12. The Rise of Slot Machine Simulators and Crash Games in India</h2>
            </div>
            <p>Crash games like Aviator and 777 slot simulators have captured massive popularity due to dynamic multiplier mechanics, interactive gameplay, and thrilling high-stakes risk-reward ratios optimized for mobile screens.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/f017d2f3e907257c8f3369bd4037b28f/invoke.js" atOptionsConfig={{ key: 'f017d2f3e907257c8f3369bd4037b28f', format: 'iframe', height: 250, width: 300, params: {} }} />

          {/* 13 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Lock className="h-4 w-4 text-[#16A34A]" />
              <h2>13. Cybersecurity Measures and Malware Protection Standards</h2>
            </div>
            <p>Every APK file linked on our platform undergoes stringent virus scanning protocols and source code inspection to protect users from malicious executables and unauthorized third-party tampering.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/d31a3f5fa7f858e8634836f93febd15e/invoke.js" />

          {/* 14 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <FileText className="h-4 w-4 text-[#0284C7]" />
              <h2>14. The Role of Agency Networks in Scaling Mobile Gaming Portals</h2>
            </div>
            <p>Our affiliate agency network provides structured commission tiers, professional marketing collateral, and dedicated tracking links for digital partners looking to expand their footprint in the online gaming sector.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/f017d2f3e907257c8f3369bd4037b28f/invoke.js" atOptionsConfig={{ key: 'f017d2f3e907257c8f3369bd4037b28f', format: 'iframe', height: 250, width: 300, params: {} }} />

          {/* 15 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Crown className="h-4 w-4 text-[#FFC107]" />
              <h2>15. Responsible Gaming Practices and Addiction Prevention</h2>
            </div>
            <p>We strongly advocate for responsible gaming habits, encouraging users to set strict budgetary limits, monitor gameplay durations, and participate strictly for entertainment rather than financial reliance.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/d31a3f5fa7f858e8634836f93febd15e/invoke.js" />

          {/* 16 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <ShieldCheck className="h-4 w-4 text-[#0284C7]" />
              <h2>16. Verification of Operator Credentials and Fair Play Audits</h2>
            </div>
            <p>Operators featured on NewYono.Games undergo independent auditing to verify certified random number generation (RNG), anti-fraud algorithms, and long-term financial stability for player deposits.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/f017d2f3e907257c8f3369bd4037b28f/invoke.js" atOptionsConfig={{ key: 'f017d2f3e907257c8f3369bd4037b28f', format: 'iframe', height: 250, width: 300, params: {} }} />

          {/* 17 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Sparkles className="h-4 w-4 text-[#FFC107]" />
              <h2>17. Optimizing Mobile Storage and Caching Strategies</h2>
            </div>
            <p>We utilize local storage caching and progressive web application technologies to ensure instant app retrieval, minimal bandwidth usage, and seamless navigation across mobile browsers.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/d31a3f5fa7f858e8634836f93febd15e/invoke.js" />

          {/* 18 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Lock className="h-4 w-4 text-[#16A34A]" />
              <h2>18. Transparency in Affiliate Links and Redirection Mechanisms</h2>
            </div>
            <p>Our redirection mechanisms ensure secure, clean handoffs from our digital directory directly to official operator servers without data leakage or malicious script injection.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/f017d2f3e907257c8f3369bd4037b28f/invoke.js" atOptionsConfig={{ key: 'f017d2f3e907257c8f3369bd4037b28f', format: 'iframe', height: 250, width: 300, params: {} }} />

          {/* 19 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <FileText className="h-4 w-4 text-[#0284C7]" />
              <h2>19. User Feedback Integration and Rating Systems</h2>
            </div>
            <p>We incorporate active user ratings, reviews, and feedback metrics to dynamically rank applications based on real-world player satisfaction and payout performance.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/d31a3f5fa7f858e8634836f93febd15e/invoke.js" />

          {/* 20 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Crown className="h-4 w-4 text-[#FFC107]" />
              <h2>20. Conclusion: Why NewYono.Games Remains India&apos;s Trusted Gaming Hub</h2>
            </div>
            <p>Through unwavering dedication to security, speed, and absolute transparency, NewYono.Games solidifies its position as the ultimate mobile gaming directory and APK download destination in 2026.</p>
          </div>
          <AdUnit scriptUrl="https://preliminarycultural.com/f017d2f3e907257c8f3369bd4037b28f/invoke.js" atOptionsConfig={{ key: 'f017d2f3e907257c8f3369bd4037b28f', format: 'iframe', height: 250, width: 300, params: {} }} />

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

        </div>

        <SiteFooter />
      </div>
    </div>
  );
}
