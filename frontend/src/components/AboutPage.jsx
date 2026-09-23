import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Crown, Sparkles, FileText, Lock, AlertTriangle, Send, ExternalLink, Zap } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import SiteFooter from "@/components/SiteFooter";

export default function AboutPage() {
  const navigate = useNavigate();

  const handleBannerAdClick = () => {
    window.open("https://www.highratecpm.com/2/8825838", "_blank");
  };

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
            <span className="font-display text-sm font-bold text-[#111111]">20-Headline Mega SEO Hub</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#22C55E] bg-[#F0FDF4] px-2 py-1 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified Elite
          </span>
        </div>

        {/* MAIN CONTENT CONTAINER WITH 20 HEADLINES AND INTERLEAVED BANNER ADS */}
        <div className="p-5 space-y-6 flex-1 text-xs text-[#555555] leading-relaxed">
          
          {/* Headline 1 */}
          <div className="space-y-2 bg-[#FFFDF5] border border-[#FFE082] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#B45309] font-bold text-sm">
              <Crown className="h-4 w-4 fill-[#FFC107] text-[#FFC107]" />
              <h2>1. The Definitive Encyclopedia of NewYono.Games: The Apex Standard in Android Gaming Aggregation</h2>
            </div>
            <p>NewYono.Games represents the absolute pinnacle and technological zenith in the evolution of digital content curation, professional application reviews, and secure mobile software distribution across international entertainment landscapes. Our platform connects everyday mobile gaming enthusiasts with official operator networks.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-amber-500 to-yellow-500 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2 animate-pulse">
            <Zap className="h-4 w-4 fill-white" /> <span>Sponsored: Claim ₹501 Instant Bonus & Play Now!</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 2 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Sparkles className="h-4 w-4 text-[#FFC107]" />
              <h2>2. Exhaustive Architectural Breakdown of Real-Cash Rummy, Teen Patti, and Slot Ecosystems</h2>
            </div>
            <p>The profound transition of traditional card games and table wagering into sophisticated digital applications has completely transformed modern entertainment. Indian Rummy requires strategic arrangement of cards into valid sequences.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Special Offer: Fast UPI Payout Apps - Download Today!</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 3 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
              <h2>3. Frictionless Financial Infrastructure: UPI Payout Integration and Security Protocols</h2>
            </div>
            <p>NewYono.Games exclusively highlights applications that have established robust financial infrastructures integrated seamlessly with India&apos;s UPI and automated banking channels. Withdrawals start from ₹100 securely.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-emerald-600 to-green-600 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Top Rated: Trusted 10M+ Downloads Gaming Store</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 4 */}
          <div className="space-y-2 bg-[#F9FAFB] border border-gray-200 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <FileText className="h-4 w-4 text-[#0284C7]" />
              <h2>4. Exhaustive Keyword Directory, SEO Architecture, and Metadata Indexing</h2>
            </div>
            <p className="text-[10px] text-[#666] leading-relaxed">Yono Games download, New Yono Rummy APK, Teen Patti real cash app, Slots spin bonus apps, Yono agency program, online rummy referral commission, instant UPI cash withdrawal games.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Click Here for Daily Jackpot & Cash Rewards!</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 5 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Lock className="h-4 w-4 text-[#16A34A]" />
              <h2>5. Rigorous Privacy Standards and Ethical Data Governance Frameworks</h2>
            </div>
            <p>We deploy enterprise tracking suites including Google Analytics, Search Console, and Microsoft Clarity to monitor performance and optimize user navigation safely.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-orange-600 to-red-600 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Exclusive Deal: Unlock 300% Bonus on Deposit!</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 6 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <ShieldCheck className="h-4 w-4 text-[#0284C7]" />
              <h2>6. Comprehensive Terms of Service and Risk Disclosures</h2>
            </div>
            <p>Real-cash gaming involves financial risk; participants must be 18+ and verify local state regulations before engaging in skill-based applications.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Play Safe & Win Big: Join Official Agency Network</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 7 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-red-500">
              <AlertTriangle className="h-4 w-4" />
              <h2>7. Strict DMCA Compliance and Intellectual Property Protection</h2>
            </div>
            <p>We operate as an informational directory and do not host pirated files or malicious software on our private servers.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-yellow-600 to-amber-600 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Instant Download Available: Click For Details</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 8 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Sparkles className="h-4 w-4 text-[#FFC107]" />
              <h2>8. Advanced Mobile App Performance Optimization and Edge Deployment</h2>
            </div>
            <p>Our deployment infrastructure uses edge-compute capabilities and Cloudflare DNS to ensure server response times remain under 200 milliseconds.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-rose-600 to-red-600 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Trending Now: Best Real Cash Earning App 2026</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 9 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <FileText className="h-4 w-4 text-[#0284C7]" />
              <h2>9. Community Engagement and 24/7 Telegram Support Networks</h2>
            </div>
            <p>We maintain active support channels through our official Telegram network, providing direct updates regarding app releases and bonus drops.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Join 10M+ Players: Click To Claim Bonus Now!</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 10 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Crown className="h-4 w-4 text-[#FFC107]" />
              <h2>10. Future Roadmap and Technological Evolution of NewYono.Games</h2>
            </div>
            <p>Our roadmap includes automated APK health monitors, artificial intelligence recommendation engines, and expanded multi-language support.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Final Call: Download Official Apps With Secure UPI Payout!</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 11 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
              <h2>11. Understanding Wagering Requirements and Bonus Terms</h2>
            </div>
            <p>All sign-up bonuses and promotional cash rewards are governed by specific operator wagering criteria to ensure fair promotional play.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-amber-600 to-yellow-600 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Unlock Free Chips: Click to Claim Reward!</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 12 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Sparkles className="h-4 w-4 text-[#FFC107]" />
              <h2>12. The Rise of Slot Machine Simulators and Crash Games in India</h2>
            </div>
            <p>Crash games like Aviator and 777 slot simulators have captured massive popularity due to dynamic multiplier mechanics and interactive gameplay.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Play Aviator & Slots: Fast UPI Deposit!</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 13 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Lock className="h-4 w-4 text-[#16A34A]" />
              <h2>13. Cybersecurity Measures and Malware Protection Standards</h2>
            </div>
            <p>Every APK file linked on our platform undergoes stringent virus scanning protocols to protect users from malicious executables.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>100% Virus Free Downloads: Click Here!</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 14 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <FileText className="h-4 w-4 text-[#0284C7]" />
              <h2>14. The Role of Agency Networks in Scaling Mobile Gaming Portals</h2>
            </div>
            <p>Our affiliate agency network provides structured commission tiers and marketing assets for digital partners looking to grow.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-pink-500 to-rose-500 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Become an Official Partner: Join Today!</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 15 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Crown className="h-4 w-4 text-[#FFC107]" />
              <h2>15. Responsible Gaming Practices and Addiction Prevention</h2>
            </div>
            <p>We strongly advocate for responsible gaming habits, encouraging users to set strict budgetary limits and play strictly for entertainment.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-red-500 to-orange-500 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Play Responsibly: Get Gaming Tips Here!</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 16 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <ShieldCheck className="h-4 w-4 text-[#0284C7]" />
              <h2>16. Verification of Operator Credentials and Fair Play Audits</h2>
            </div>
            <p>Operators featured on NewYono.Games undergo independent auditing to verify fair random number generation and financial stability.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Verified Fair Play: Explore Top Games!</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 17 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Sparkles className="h-4 w-4 text-[#FFC107]" />
              <h2>17. Optimizing Mobile Storage and Caching Strategies</h2>
            </div>
            <p>We use local storage caching and progressive web app technologies to ensure instant app retrieval and seamless performance.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-yellow-500 to-lime-600 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Fast Loading Store: Click to Test Speed!</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 18 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Lock className="h-4 w-4 text-[#16A34A]" />
              <h2>18. Transparency in Affiliate Links and Redirection Mechanisms</h2>
            </div>
            <p>Our redirection mechanisms ensure secure handoffs from our directory to official operator servers without data leakage.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Secure Redirection: Click For Safe APKs!</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 19 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <FileText className="h-4 w-4 text-[#0284C7]" />
              <h2>19. User Feedback Integration and Rating Systems</h2>
            </div>
            <p>We incorporate active user ratings and feedback metrics to dynamically rank applications based on real-world player satisfaction.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-sky-500 to-indigo-500 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Top Rated Apps: Click to View Rankings!</span> <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Headline 20 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Crown className="h-4 w-4 text-[#FFC107]" />
              <h2>20. Conclusion: Why NewYono.Games Remains India&apos;s Trusted Gaming Hub</h2>
            </div>
            <p>Through unwavering dedication to security, speed, and transparency, NewYono.Games solidifies its position as the ultimate mobile gaming destination.</p>
          </div>
          <div onClick={handleBannerAdClick} className="cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3 rounded-xl shadow-md text-center font-bold flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 fill-white" /> <span>Final Step: Click to Download Official App Now!</span> <ExternalLink className="h-3.5 w-3.5" />
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

        </div>

        <SiteFooter />
      </div>
    </div>
  );
}
