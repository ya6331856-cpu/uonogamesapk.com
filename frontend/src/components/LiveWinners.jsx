import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import api from "@/lib/api";

/**
 * Auto-scrolling live winners ticker.
 */
export const LiveWinners = ({ config }) => {
  const [winners, setWinners] = useState([]);

  useEffect(() => {
    api.get("/winners").then((r) => setWinners(r.data)).catch(() => setWinners([]));
  }, []);

  if (config?.enabled === false || winners.length === 0) return null;
  const speed = config?.scroll_speed || 40;
  const loop = [...winners, ...winners];

  return (
    <section data-testid="live-winners" className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
        </span>
        <h2 className="font-display text-base font-bold text-[#111111]">Live Winners</h2>
      </div>
      <div className="relative overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white py-2.5 shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
        <div
          className="flex w-max gap-3"
          style={{ animation: `winners-scroll ${speed}s linear infinite` }}
        >
          {loop.map((w, i) => (
            <div key={i} className="flex shrink-0 items-center gap-2 rounded-full bg-[#F0FDF4] px-3 py-1.5">
              <Trophy className="h-3.5 w-3.5 text-[#22C55E]" />
              <span className="text-xs font-semibold text-[#111111]">{w.name}</span>
              {w.amount && <span className="text-xs font-bold text-[#22C55E]">won {w.amount}</span>}
              {w.game && <span className="text-[11px] text-[#777777]">• {w.game}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveWinners;
