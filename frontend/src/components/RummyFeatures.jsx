import { motion } from "framer-motion";
import {
  Banknote, Zap, ShieldCheck, Layers, Gift, Headphones, Spade, Trophy,
} from "lucide-react";

const FEATURES = [
  { icon: Banknote, title: "Real Cash Games", desc: "Play cash games & tournaments and win real money daily.", color: "#22C55E", bg: "#F0FDF4" },
  { icon: Zap, title: "Instant Withdrawals", desc: "Fast, secure payouts straight to your UPI or bank.", color: "#FFB300", bg: "#FFF8E1" },
  { icon: ShieldCheck, title: "100% Safe & Fair", desc: "SSL-encrypted, RNG-certified and fair-play verified.", color: "#229ED9", bg: "#E8F6FD" },
  { icon: Gift, title: "Welcome Bonus", desc: "Grab a big bonus on your very first deposit.", color: "#EC4899", bg: "#FDF2F8" },
  { icon: Layers, title: "Multiple Variants", desc: "Points, Pool (101/201) & Deals Rummy — your choice.", color: "#8B5CF6", bg: "#F5F3FF" },
  { icon: Headphones, title: "24/7 Support", desc: "Round-the-clock help whenever you need it.", color: "#FF6B35", bg: "#FFF3ED" },
];

const MODES = [
  { name: "Points Rummy", tag: "Fast" },
  { name: "Pool Rummy", tag: "101 / 201" },
  { name: "Deals Rummy", tag: "Fixed Deals" },
];

export const RummyFeatures = () => (
  <section data-testid="rummy-features" className="space-y-3">
    <div className="flex items-center gap-2">
      <Spade className="h-4 w-4 text-[#FFC107]" />
      <h2 className="font-display text-base font-bold text-[#111111]">Why Play Rummy Here</h2>
      <span className="h-px flex-1 bg-gradient-to-r from-[#FFC107]/40 to-transparent" />
    </div>

    {/* Game modes chips */}
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
      {MODES.map((m) => (
        <div
          key={m.name}
          data-testid={`rummy-mode-${m.name.replace(/\s+/g, "-").toLowerCase()}`}
          className="flex shrink-0 items-center gap-2 rounded-full border border-[#FFE082] bg-gradient-to-r from-[#FFF8E1] to-white px-3.5 py-2"
        >
          <Trophy className="h-3.5 w-3.5 text-[#FFB300]" />
          <span className="font-display text-xs font-semibold text-[#111111]">{m.name}</span>
          <span className="rounded-full bg-[#FFC107] px-1.5 py-0.5 text-[10px] font-bold text-[#111111]">{m.tag}</span>
        </div>
      ))}
    </div>

    {/* Feature grid */}
    <div className="grid grid-cols-2 gap-2.5">
      {FEATURES.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
          className="rounded-[18px] border border-[#E5E7EB] bg-white p-3 shadow-[0_6px_20px_rgba(0,0,0,0.03)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: f.bg }}>
            <f.icon className="h-4 w-4" style={{ color: f.color }} />
          </span>
          <p className="mt-2 font-display text-[13px] font-semibold leading-tight text-[#111111]">{f.title}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-[#777777]">{f.desc}</p>
        </motion.div>
      ))}
    </div>

    <p className="px-1 text-[10px] leading-relaxed text-[#999999]">
      This game may be habit-forming or financially risky. Play responsibly. 18+ only. Rummy is a game of skill.
    </p>
  </section>
);

export default RummyFeatures;
