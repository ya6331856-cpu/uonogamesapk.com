import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import RippleButton from "../components/RippleButton";

function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const sessionExpired = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("expired") === "1";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen flex-col justify-center px-6">
      <Link
        to="/"
        data-testid="back-home"
        className="absolute left-4 top-4 inline-flex items-center gap-1 text-sm text-[#777777]"
      >
        <ArrowLeft className="h-4 w-4" /> Store
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-6 text-center">
          <img
            src="/logo-icon-v2.png"
            alt="YONO GAMES - Play and Win"
            className="mx-auto mb-3 h-20 w-20 rounded-[20px] shadow-[0_10px_30px_rgba(255,193,7,0.35)]"
          />
          <h1 className="font-display text-2xl font-bold">
            <span className="text-[#22C55E]">YONO</span>{" "}
            <span className="bg-gradient-to-r from-[#FFD54F] to-[#FFB300] bg-clip-text text-transparent">GAMES</span>
          </h1>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFD54F]">
            Admin Panel · Play &amp; Win
          </p>
          <p className="mt-2 text-sm text-[#777777]">Sign in to manage YONO GAMES</p>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-[22px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          {sessionExpired && (
            <p data-testid="session-expired-notice" className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              Your session expired. Please sign in again to continue.
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-[#555555]">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
              <Input
                id="email"
                data-testid="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arfuu9@gmail.com"
                className="h-11 rounded-xl border-[#E5E7EB] pl-10 focus-visible:ring-[#FFC107]"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-[#555555]">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
              <Input
                id="password"
                data-testid="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-xl border-[#E5E7EB] pl-10 focus-visible:ring-[#FFC107]"
                required
              />
            </div>
          </div>

          {error && (
            <p data-testid="login-error" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <RippleButton
            type="submit"
            disabled={loading}
            data-testid="login-submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FFB300] py-3 text-sm font-bold text-[#111111] shadow-[0_8px_20px_rgba(255,193,7,0.45)] disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Signing in..." : "Sign In"}
          </RippleButton>
        </form>
      </motion.div>
    </div>
  );
}
