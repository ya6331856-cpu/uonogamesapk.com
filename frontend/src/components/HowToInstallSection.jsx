import { Download, UserPlus, Gift, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function HowToInstallSection() {
  return (
    <div className="bg-gradient-to-b from-white to-[#F8F9FA] border border-[#E5E7EB] rounded-2xl p-4 my-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2.5">
        <div className="h-7 w-7 rounded-full bg-[#FFC107]/20 flex items-center justify-center text-[#D97706] font-bold text-xs">
          ⚡
        </div>
        <div>
          <h3 className="font-display font-bold text-xs text-[#111111]">
            How to Download, Install & Sign-Up on NewYono.Games
          </h3>
          <p className="text-[10px] text-[#777777]">
            Follow these simple steps to get your ₹501 bonus instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 text-[11px] text-[#444444]">
        <div className="flex items-start gap-2.5 bg-white p-2 rounded-xl border border-[#F0F0F0]">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFC107] text-[10px] font-bold text-[#111]">
            1
          </span>
          <div>
            <strong className="text-[#111] font-semibold">Download Official APK:</strong> Click the "Get" or "Download" button on any game card to download the secure APK file directly to your Android device.
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-white p-2 rounded-xl border border-[#F0F0F0]">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFC107] text-[10px] font-bold text-[#111]">
            2
          </span>
          <div>
            <strong className="text-[#111] font-semibold">Enable Unknown Sources:</strong> If prompted, go to your phone settings and allow installation from unknown sources to install the APK safely.
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-white p-2 rounded-xl border border-[#F0F0F0]">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFC107] text-[10px] font-bold text-[#111]">
            3
          </span>
          <div>
            <strong className="text-[#111] font-semibold">Sign-Up & Verify Mobile:</strong> Open the installed app, register using your active mobile number via OTP, and bind your profile.
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-white p-2 rounded-xl border border-[#F0F0F0]">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-[10px] font-bold text-white">
            ✓
          </span>
          <div>
            <strong className="text-[#111] font-semibold">Claim Bonus & Play:</strong> Your sign-up bonus (up to ₹501+) will be credited instantly to your wallet. Enjoy real cash games with fast UPI withdrawals!
          </div>
        </div>
      </div>
    </div>
  );
}
