import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import api from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import RippleButton from "@/components/RippleButton";

export const PageHeader = ({ title, desc, action }) => (
  <div className="mb-6 flex items-start justify-between gap-3">
    <div>
      <h1 className="font-display text-2xl font-bold text-[#111111]">{title}</h1>
      {desc && <p className="mt-1 text-sm text-[#777777]">{desc}</p>}
    </div>
    {action}
  </div>
);

export const Card = ({ children, className = "" }) => (
  <div className={`rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.03)] ${className}`}>
    {children}
  </div>
);

export const Field = ({ label, value, onChange, placeholder, type = "text", testId }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold text-[#555555]">{label}</Label>
    <Input data-testid={testId} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} className="rounded-xl" />
  </div>
);

export const Area = ({ label, value, onChange, placeholder, rows = 3, testId }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold text-[#555555]">{label}</Label>
    <Textarea data-testid={testId} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="rounded-xl" />
  </div>
);

export const Toggle = ({ label, checked, onChange, testId }) => (
  <div className="flex items-center justify-between rounded-xl bg-[#F8F9FA] px-3 py-2.5">
    <Label className="text-xs font-semibold text-[#555555]">{label}</Label>
    <Switch data-testid={testId} checked={!!checked} onCheckedChange={onChange} />
  </div>
);

/**
 * Hook to load/edit/save the site settings singleton.
 */
export const useSettingsEditor = () => {
  const { refreshSettings } = useSettings();
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings").then((r) => setS(r.data)).catch(() => setS({}));
  }, []);

  const set = (path, value) => {
    setS((prev) => {
      const next = structuredClone(prev);
      let obj = next;
      const keys = path.split(".");
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]] = obj[keys[i]] || {};
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings", s);
      await refreshSettings();
      toast.success("Saved successfully");
    } catch (e) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return { s, setS, set, save, saving, ready: !!s };
};

export const SaveBar = ({ onSave, saving, testId = "save-btn" }) => (
  <RippleButton onClick={onSave} disabled={saving} data-testid={testId}
    className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FFB300] px-6 py-2.5 text-sm font-bold text-[#111111] shadow-[0_8px_20px_rgba(255,193,7,0.45)] disabled:opacity-60">
    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
  </RippleButton>
);

export const Spinner = () => (
  <div className="py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#FFC107]" /></div>
);
