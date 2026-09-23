import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Crown, Sparkles, FileText, Lock, AlertTriangle, Send } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import SiteFooter from "@/components/SiteFooter";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111]">
      <SEOHead 
        title="About NewYono.Games - Massive Ultimate Mega-Word Gaming Directory & SEO Engine" 
        description="Explore our exhaustive, multi-thousand word master encyclopedia covering NewYono.Games, real-cash rummy architectures, Teen Patti mastery, slot mechanics, UPI security, and global agency networks." 
        canonical="https://newyono.games/about"
      />

      <div className="max-w-md mx-auto bg-white min-h-screen shadow-sm flex flex-col">
        {/* TOP BAR */}
        <div className="sticky top-0 z-30 flex items-center justify-between bg-white/95 px-4 py-3 backdrop-blur-md border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#E5E7EB] text-[#111111] shadow-sm hover:bg-[#F1F1F1]">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="font-display text-sm font-bold text-[#111111]">Mega SEO Encyclopedia Hub</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#22C55E] bg-[#F0FDF4] px-2 py-1 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified Elite
          </span>
        </div>

        {/* MAIN CONTENT CONTAINER WITH MASSIVE EXTENDED ENCYCLOPEDIA TEXT */}
        <div className="p-5 space-y-6 flex-1 text-xs text-[#555555] leading-relaxed">
          
          {/* Headline 1 */}
          <div className="space-y-2 bg-[#FFFDF5] border border-[#FFE082] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#B45309] font-bold text-sm">
              <Crown className="h-4 w-4 fill-[#FFC107] text-[#FFC107]" />
              <h2>1. The Definitive Encyclopedia of NewYono.Games: The Apex Standard in Android Gaming Aggregation, Digital Curation, and Secure APK Distribution Networks</h2>
            </div>
            <p>
              NewYono.Games represents the absolute pinnacle and technological zenith in the evolution of digital content curation, professional application reviews, and secure mobile software distribution across both the Indian subcontinent and international mobile entertainment landscapes. In an era where the digital economy and mobile gaming sectors have expanded into multi-billion-dollar industries characterized by millions of active daily participants, locating safe, verified, thoroughly vetted, and high-performance Android applications has become an increasingly complex undertaking. Our platform was architected, designed, and deployed from the ground up to resolve this critical market friction, operating as an elite, independent informational directory that seamlessly bridges the gap between everyday mobile gaming enthusiasts and official, enterprise-grade software operators. We do not merely act as an indiscriminate directory listing; rather, we execute comprehensive, multi-layered security profiling, source code verification, compatibility testing, and performance benchmarking for every single APK file hosted or referenced across our network infrastructure. Whether you are searching for high-performance real-cash Indian Rummy variants, tactical Teen Patti master editions, immersive 777 slot machine simulators, dynamic crash multiplier games like Aviator, or casual multiplayer arcade Ludo tournaments, NewYono.Games functions as your definitive, centralized repository for secure digital leisure. Our operational philosophy is anchored entirely in user empowerment through radical transparency, offering precise, real-time telemetry regarding file sizes, version histories (such as our standardized v2026 builds), active concurrent player counts, verified average user ratings, and exclusive sign-up bonus allocations ranging dynamically from ₹501 to ₹2501. By leveraging cutting-edge web development frameworks, responsive user interfaces, high-speed local storage caching, and robust distributed Content Delivery Networks, we guarantee that every single visitor enjoys a frictionless, lightning-fast browsing and downloading experience, cemented by our unwavering institutional dedication to absolute trust, rigorous accountability, and uncompromising digital excellence throughout 2026 and beyond.
            </p>
          </div>

          {/* Headline 2 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Sparkles className="h-4 w-4 text-[#FFC107]" />
              <h2>2. Exhaustive Architectural Breakdown, Gameplay Mechanics, and Strategic Frameworks of Real-Cash Rummy, Teen Patti, and Slot Ecosystems</h2>
            </div>
            <p>
              The profound transition of traditional card games, table wagering, and arcade pastimes into sophisticated, high-performance digital mobile applications has completely transformed the modern entertainment paradigm. At NewYono.Games, we conduct exhaustive analytical deep-dives into the mechanical, mathematical, psychological, and strategic intricacies that govern contemporary real-cash gaming ecosystems. Indian Rummy, a strategic card game deeply embedded in cultural leisure and cognitive training, demands acute intellectual processing, advanced probability calculation, psychological resilience, and agile memory retention as participants arrange a complex hand of thirteen cards into valid sequences and sets. Our featured variants—including flagship titles like New Yono Rummy, Gold Rummy, and Ind Rummy—integrate sophisticated anti-collusion algorithms, cryptographically certified Random Number Generators (RNG), and seamless multi-threaded matchmaking architectures designed to guarantee absolute fairness, integrity, and uncompromised competitive balance. Similarly, Teen Patti master editions deliver accelerated wagering thrills, dynamic blind-and-seen psychological maneuvers, and massive daily tournament structures engineered specifically for high-stakes card enthusiasts seeking competitive glory. Beyond traditional card genres, our platform provides comprehensive technical coverage of 777 slot machine games, color prediction matrices, Dragon Tiger prediction engines, and Plinko-style arcade simulations. These applications utilize advanced vector graphics pipelines, hardware-accelerated shaders, and optimized rendering frameworks to ensure consistently responsive 60 Frames Per Second (FPS) performance across a diverse spectrum of mobile hardware configurations, ranging from high-end flagship smartphones to economical budget devices. We complement our comprehensive application directory with expert-authored strategy guides, methodical bankroll management frameworks, detailed bonus wagering requirement breakdowns, and tactical decision matrices, ensuring that our active community members are fully equipped to maximize both their strategic proficiency and their overall return on entertainment investment.
            </p>
          </div>

          {/* Headline 3 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
              <h2>3. Frictionless Financial Infrastructure: Comprehensive UPI Payout Integration, Multi-Layered Security Protocols, and Fast Withdrawal Guides</h2>
            </div>
            <p>
              Historically, one of the most prominent friction points and user pain points within the mobile real-cash gaming sector has been the technical complexity, processing latency, and security vulnerability associated with monetary deposits and payout withdrawal gateways. NewYono.Games exclusively highlights, reviews, and aggregates applications that have established robust, enterprise-grade financial infrastructures integrated seamlessly with India&apos;s revolutionary Unified Payments Interface (UPI), automated interbank transfer channels, and verified digital wallets including Paytm, PhonePe, Google Pay, and standard Net Banking portals. The software applications featured prominently on our platform are subjected to rigorous financial auditing to ensure they deploy lightning-fast automated payout mechanisms, enabling victorious players to initiate and complete UPI withdrawals starting at minimum thresholds as low as ₹100, with capital frequently credited to personal bank accounts within minutes of request submission. Furthermore, transactional security is reinforced through the uncompromising deployment of advanced 256-bit Secure Sockets Layer (SSL) encryption protocols, multi-factor authentication (MFA) verification checkpoints, and automated Know Your Customer (KYC) onboarding pipelines that actively protect users against unauthorized account access, identity theft, and fraudulent financial interception. We publish comprehensive, step-by-step instructional guides detailing how users can link their UPI virtual payment addresses (VPAs) securely, execute frictionless cash deposits to claim lucrative sign-up bonuses, and navigate withdrawal verification protocols without encountering unnecessary administrative bottlenecks. This absolute institutional focus on transactional transparency, banking reliability, and financial safety ensures that players can engage in competitive online gaming with total psychological peace of mind, knowing their capital and earnings are protected by state-of-the-art cybersecurity defenses.
            </p>
          </div>

          {/* Headline 4 */}
          <div className="space-y-2 bg-[#F9FAFB] border border-gray-200 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <FileText className="h-4 w-4 text-[#0284C7]" />
              <h2>4. Exhaustive Keyword Directory, Advanced Search Engine Optimization (SEO) Architecture, Metadata Indexing, and Technical Deployment Parameters</h2>
            </div>
            <p className="text-[10px] text-[#666] leading-relaxed">
              Yono Games download, New Yono Rummy APK, Teen Patti real cash app, Slots spin bonus apps, Yono agency program, online rummy referral commission, instant UPI cash withdrawal games, Android gaming store India, 777 slots apk download, Best rummy app with bonus, Yono partner network official, trusted gaming platform 2026, Teen Patti Gold, Ludo cash winning apps, Dragon Tiger tricks, fast withdrawal rummy apps, NewYono.Games official link, multiplayer card game portals, safe APK file repository, daily sign-up bonus apps, Jaiho slots download, Diwa games portal, 1Win slot integration, secure UPI payout gateways, Android gaming optimization, high performance mobile arcade, verified APK review directory, executive gaming community network, Telegram reward channel links, official agency partnership portal, professional web application deployment, search engine optimization analytics, Google Search Console tracking, Microsoft Clarity user behavior metrics, secure 256-bit SSL encryption standards, digital entertainment market analysis, mobile application distribution networks, real-time winning tickers, live player payout notifications, responsible gaming compliance guidelines, high-speed React web hosting, Cloudflare DNS management, Vercel edge deployment architectures, Supabase PostgreSQL backend integration, Adsterra monetization frameworks, Semrush site audit compliance, Bing Webmaster tools indexing, automated GitHub Actions workflows, professional software repository management, mobile APK version v2026 tracking, custom apparel and consumer equipment sourcing, B2B product procurement inquiries, Upstox and Groww securities monitoring, Paytm Money demat account KYC verification, Telegram Premium subscription management, Bank of Baroda commercial current account applications, high-volume digital traffic scaling strategies, cross-platform mobile responsive layouts, programmatic meta tag generation, XML sitemap indexation, robots.txt optimization protocols, schema markup integration, rich snippet configuration, structured data validation, organic search ranking algorithms, web vitals performance tuning, asynchronous JavaScript loading, CSS minification, and comprehensive enterprise-level web security configurations.
            </p>
          </div>

          {/* Headline 5 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <Lock className="h-4 w-4 text-[#16A34A]" />
              <h2>5. Rigorous Privacy Standards, Ethical Data Governance Frameworks, and Behavioral Analytics Transparency Policies</h2>
            </div>
            <p>
              In an interconnected digital age defined by heightened cyber connectivity, data harvesting, and evolving privacy concerns, NewYono.Games maintains an uncompromising, militant stance on user privacy, ethical data governance, and absolute transparency regarding behavioral telemetry tracking. We want our global visitor base to understand precisely, without ambiguity, how information is gathered, processed, secured, and retained when interacting with our digital publishing platform. To continuously optimize web performance, minimize page load latencies, and refine our user interface design architecture, we deploy industry-standard diagnostic tools and enterprise tracking suites—including Google Analytics, Google Search Console, Microsoft Clarity, Bing Webmaster Tools, and Semrush advanced site audit engines. These diagnostic systems collect anonymized telemetry parameters, such as device viewport dimensions, geographic referral traffic streams, active session durations, and aggregate clickstream interaction patterns. We explicitly pledge and guarantee that we never sell, trade, rent, lease, or distribute personally identifiable information (PII) to external marketing brokers, aggressive advertising syndicates, or unauthorized commercial entities. Furthermore, when users click through our outbound links to download third-party gaming applications, those external digital environments operate under their own distinct privacy policies, terms of service, and cryptographic security frameworks. We strongly advise every visitor to thoroughly examine the legal documentation, privacy agreements, and terms of service of any external gaming operator prior to registering player accounts or submitting sensitive financial credentials.
            </p>
          </div>

          {/* Headline 6 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <ShieldCheck className="h-4 w-4 text-[#0284C7]" />
              <h2>6. Comprehensive Terms of Service, Legal Risk Disclosures, and Official Affiliate Agency Partnership Frameworks</h2>
            </div>
            <p>
              By accessing, browsing, interacting with, or downloading software applications via NewYono.Games, users formally acknowledge, understand, and agree to adhere strictly to our comprehensive Terms of Service and legal disclaimers. It is of absolute paramount importance to recognize that real-cash gaming, online rummy tournaments, competitive card wagering, and referral affiliate agency partnership programs inherently involve substantial financial risk. Participants must be at least 18 years of age (or meet the statutory legal age of majority in their respective state or national jurisdiction) and must independently verify the statutory legality of skill-based cash applications within their specific regional governance boundaries before engaging in financial deposits or competitive gameplay. All promotional incentives, sign-up bonus credits (such as the standard ₹501 promotional allocation), daily rebate multipliers, and referral commissions are strictly subject to individual operator wagering requirements, turnover thresholds, and maximum withdrawal caps. NewYono.Games functions purely as an independent informational review directory and software download aggregator; consequently, we assume zero direct legal liability for external transactional discrepancies, technical server outages, banking gateway disputes, or financial losses incurred on third-party gaming platforms. Additionally, our highly sought-after Official Agency Partnership Program offers dedicated tracking links, professional marketing collateral, and lucrative commission tiers for verified partners seeking to scale their digital enterprise within the booming online gaming sector.
            </p>
          </div>

          {/* Headline 7 */}
          <div className="space-y-2 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#111] font-bold text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h2>7. Strict DMCA Compliance, Intellectual Property Protection, and Formal Content Removal Protocols</h2>
            </div>
            <p>
              NewYono.Games operates strictly and transparently as an independent informational APK review directory and software download aggregator platform. We categorically do not host cracked executables, modified APK binaries, copyrighted source codes, pirated media, or malicious software on our private hosting servers. All outbound download buttons, referral links, and promotional banners redirect web traffic directly to official, verified operator distribution channels and secure servers. We maintain an uncompromising commitment to respecting global intellectual property rights and operate in full, unreserved compliance with the Digital Millennium Copyright Act (DMCA), international copyright conventions, and trademark protection laws. If intellectual property copyright holders, trademark proprietors, or legally authorized corporate representatives identify any accidental text discrepancy, asset conflict, or trademark overlap, we cordially invite and encourage them to submit a formal infringement notification directly through our official Telegram agency network channel. Upon receiving a fully verified, substantiated, and legally compliant claim, our specialized technical compliance team conducts immediate internal investigations and executes prompt content removal, link rectification, or metadata updates to honor intellectual property rights, maintain absolute legal transparency, and preserve our stellar standing as a trusted digital directory.
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

        </div>

        <SiteFooter />
      </div>
    </div>
  );
}
