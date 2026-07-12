import { useState } from "react";
import { Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import RippleButton from "@/components/RippleButton";

export const RedeemBox = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const redeem = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/redeem", { code });
      toast.success("Code redeemed!", { description: data.reward });
      setCode("");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section data-testid="redeem-box" className="rounded-[20px] border border-[#FFE082] bg-gradient-to-br from-[#FFF8E1] to-white p-4 shadow-[0_6px_20px_rgba(255,193,7,0.12)]">
      <div className="flex items-center gap-2">
        <Gift className="h-4 w-4 text-[#FFB300]" />
        <h2 className="font-display text-sm font-bold text-[#111111]">Have a Redeem Code?</h2>
      </div>
      <p className="mt-1 text-xs text-[#777777]">Enter your code to unlock rewards & bonuses.</p>
      <div className="mt-3 flex gap-2">
        <Input
          data-testid="redeem-input"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ENTER CODE"
          className="h-11 rounded-full border-[#FFE082] bg-white text-sm font-semibold uppercase tracking-wider focus-visible:ring-[#FFC107]"
        />
        <RippleButton
          onClick={redeem}
          disabled={loading}
          data-testid="redeem-submit"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#FFC107] px-5 text-sm font-bold text-[#111111] shadow-[0_6px_16px_rgba(255,193,7,0.4)] hover:bg-[#FFB300] disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Redeem"}
        </RippleButton>
      </div>
    </section>
  );
};

export default RedeemBox;
