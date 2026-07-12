import { useEffect, useState } from "react";
import { Loader2, Save, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { LEGAL_SECTIONS } from "@/lib/legal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import RippleButton from "@/components/RippleButton";

const Field = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-1">
    <Label className="text-xs font-semibold text-[#555555]">{label}</Label>
    <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} className="rounded-xl" />
  </div>
);

const Toggle = ({ label, checked, onChange, testId }) => (
  <div className="flex items-center justify-between rounded-xl bg-[#F8F9FA] px-3 py-2.5">
    <Label className="text-xs font-semibold text-[#555555]">{label}</Label>
    <Switch data-testid={testId} checked={!!checked} onCheckedChange={onChange} />
  </div>
);

export default function AdminSettings() {
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

  const moveSection = (i, dir) => {
    setS((prev) => {
      const next = structuredClone(prev);
      const arr = next.sections;
      const j = i + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings", s);
      await refreshSettings();
      toast.success("Settings saved");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (!s) {
    return <div className="py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#FFC107]" /></div>;
  }

  const legal = s.legal || {};

  return (
    <div className="space-y-4">
      <RippleButton onClick={save} disabled={saving} data-testid="save-settings-btn"
        className="sticky top-[60px] z-10 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FFB300] py-3 text-sm font-bold text-[#111111] shadow-[0_8px_20px_rgba(255,193,7,0.45)] disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save All Settings
      </RippleButton>

      <Accordion type="multiple" className="space-y-2.5">
        {/* Branding */}
        <AccordionItem value="branding" className="rounded-[18px] border border-[#E5E7EB] bg-white px-4">
          <AccordionTrigger className="text-sm font-semibold">Branding & Contact</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <Field label="Site Name" value={s.branding?.site_name} onChange={(v) => set("branding.site_name", v)} />
            <Field label="Logo Text" value={s.branding?.logo_text} onChange={(v) => set("branding.logo_text", v)} />
            <Field label="Logo Image URL" value={s.branding?.logo_url} onChange={(v) => set("branding.logo_url", v)} placeholder="/uploads/... or https://" />
            <Field label="Favicon URL" value={s.branding?.favicon_url} onChange={(v) => set("branding.favicon_url", v)} />
            <Field label="Footer Text" value={s.branding?.footer_text} onChange={(v) => set("branding.footer_text", v)} />
            <Field label="Copyright" value={s.branding?.copyright} onChange={(v) => set("branding.copyright", v)} />
            <Field label="Support Email" value={s.contact?.email} onChange={(v) => set("contact.email", v)} />
            <Field label="Instagram URL" value={s.contact?.instagram} onChange={(v) => set("contact.instagram", v)} />
            <Field label="YouTube URL" value={s.contact?.youtube} onChange={(v) => set("contact.youtube", v)} />
            <Field label="Twitter/X URL" value={s.contact?.twitter} onChange={(v) => set("contact.twitter", v)} />
          </AccordionContent>
        </AccordionItem>

        {/* Hero */}
        <AccordionItem value="hero" className="rounded-[18px] border border-[#E5E7EB] bg-white px-4">
          <AccordionTrigger className="text-sm font-semibold">Hero Banner</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <Toggle label="Show Hero" checked={s.hero?.enabled} onChange={(v) => set("hero.enabled", v)} testId="toggle-hero" />
            <Field label="Banner Image URL" value={s.hero?.banner_url} onChange={(v) => set("hero.banner_url", v)} />
            <Field label="Headline" value={s.hero?.headline} onChange={(v) => set("hero.headline", v)} />
            <Field label="Subtitle" value={s.hero?.subtitle} onChange={(v) => set("hero.subtitle", v)} />
          </AccordionContent>
        </AccordionItem>

        {/* Stats */}
        <AccordionItem value="stats" className="rounded-[18px] border border-[#E5E7EB] bg-white px-4">
          <AccordionTrigger className="text-sm font-semibold">Statistics</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <Toggle label="Show Stats" checked={s.stats?.enabled} onChange={(v) => set("stats.enabled", v)} testId="toggle-stats" />
            {(s.stats?.items || []).map((it, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 rounded-xl bg-[#F8F9FA] p-2">
                <Field label="Label" value={it.label} onChange={(v) => set(`stats.items.${i}.label`, v)} />
                <Field label="Value" value={it.value} onChange={(v) => set(`stats.items.${i}.value`, v)} placeholder="auto or 4.8" />
                <Field label="Suffix" value={it.suffix} onChange={(v) => set(`stats.items.${i}.suffix`, v)} placeholder="+" />
              </div>
            ))}
            <p className="text-[11px] text-[#999999]">Tip: set Value to &quot;auto&quot; for live download/verified counts.</p>
          </AccordionContent>
        </AccordionItem>

        {/* Telegram */}
        <AccordionItem value="telegram" className="rounded-[18px] border border-[#E5E7EB] bg-white px-4">
          <AccordionTrigger className="text-sm font-semibold">Telegram</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <Toggle label="Show Telegram CTA" checked={s.telegram?.enabled} onChange={(v) => set("telegram.enabled", v)} testId="toggle-telegram" />
            <Field label="Channel Link" value={s.telegram?.link} onChange={(v) => set("telegram.link", v)} placeholder="https://t.me/yourchannel" />
            <Field label="CTA Text" value={s.telegram?.cta_text} onChange={(v) => set("telegram.cta_text", v)} />
            <Field label="Sub Text" value={s.telegram?.sub_text} onChange={(v) => set("telegram.sub_text", v)} />
            <Field label="Member Count" value={s.telegram?.member_count} onChange={(v) => set("telegram.member_count", v)} placeholder="50K" />
          </AccordionContent>
        </AccordionItem>

        {/* Announcement */}
        <AccordionItem value="announcement" className="rounded-[18px] border border-[#E5E7EB] bg-white px-4">
          <AccordionTrigger className="text-sm font-semibold">Announcement Bar</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <Toggle label="Show Announcement" checked={s.announcement?.enabled} onChange={(v) => set("announcement.enabled", v)} testId="toggle-announcement" />
            <Field label="Text" value={s.announcement?.text} onChange={(v) => set("announcement.text", v)} />
            <Field label="Link (optional)" value={s.announcement?.link} onChange={(v) => set("announcement.link", v)} />
          </AccordionContent>
        </AccordionItem>

        {/* Theme */}
        <AccordionItem value="theme" className="rounded-[18px] border border-[#E5E7EB] bg-white px-4">
          <AccordionTrigger className="text-sm font-semibold">Theme Colors</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <Field label="Primary Color" value={s.theme?.primary} onChange={(v) => set("theme.primary", v)} placeholder="#FFC107" />
            <Field label="Secondary Color" value={s.theme?.secondary} onChange={(v) => set("theme.secondary", v)} placeholder="#FFB300" />
          </AccordionContent>
        </AccordionItem>

        {/* Sections order + enable */}
        <AccordionItem value="sections" className="rounded-[18px] border border-[#E5E7EB] bg-white px-4">
          <AccordionTrigger className="text-sm font-semibold">Homepage Sections (order & visibility)</AccordionTrigger>
          <AccordionContent className="space-y-2 pb-4">
            {(s.sections || []).map((sec, i) => (
              <div key={sec.id} data-testid={`section-row-${sec.id}`} className="flex items-center gap-2 rounded-xl bg-[#F8F9FA] px-3 py-2">
                <span className="flex-1 text-sm font-medium text-[#111111]">{sec.label}</span>
                <Switch data-testid={`section-toggle-${sec.id}`} checked={sec.enabled} onCheckedChange={(v) => set(`sections.${i}.enabled`, v)} />
                <button onClick={() => moveSection(i, -1)} disabled={i === 0} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#555555] disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => moveSection(i, 1)} disabled={i === s.sections.length - 1} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#555555] disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* SEO */}
        <AccordionItem value="seo" className="rounded-[18px] border border-[#E5E7EB] bg-white px-4">
          <AccordionTrigger className="text-sm font-semibold">SEO</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <Field label="Meta Title" value={s.seo?.meta_title} onChange={(v) => set("seo.meta_title", v)} />
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#555555]">Meta Description</Label>
              <Textarea value={s.seo?.meta_description ?? ""} onChange={(e) => set("seo.meta_description", e.target.value)} rows={2} className="rounded-xl" />
            </div>
            <Field label="Keywords" value={s.seo?.keywords} onChange={(v) => set("seo.keywords", v)} />
            <Field label="OG Image URL" value={s.seo?.og_image} onChange={(v) => set("seo.og_image", v)} />
          </AccordionContent>
        </AccordionItem>

        {/* Ads */}
        <AccordionItem value="ads" className="rounded-[18px] border border-[#E5E7EB] bg-white px-4">
          <AccordionTrigger className="text-sm font-semibold">Advertisements</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <Toggle label="Enable Ads" checked={s.ads?.enabled} onChange={(v) => set("ads.enabled", v)} testId="toggle-ads" />
            <Field label="AdSense Client ID" value={s.ads?.adsense_client} onChange={(v) => set("ads.adsense_client", v)} placeholder="ca-pub-xxxx" />
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#555555]">Custom Banner HTML</Label>
              <Textarea value={s.ads?.banner_html ?? ""} onChange={(e) => set("ads.banner_html", e.target.value)} rows={3} className="rounded-xl text-xs" />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Winners config */}
        <AccordionItem value="winners" className="rounded-[18px] border border-[#E5E7EB] bg-white px-4">
          <AccordionTrigger className="text-sm font-semibold">Live Winners Ticker</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <Toggle label="Enable Ticker" checked={s.winners_config?.enabled} onChange={(v) => set("winners_config.enabled", v)} testId="toggle-winners" />
            <Field label="Scroll Speed (seconds)" type="number" value={s.winners_config?.scroll_speed} onChange={(v) => set("winners_config.scroll_speed", parseInt(v) || 40)} />
            <p className="text-[11px] text-[#999999]">Add/edit winners in the &quot;Winners&quot; tab.</p>
          </AccordionContent>
        </AccordionItem>

        {/* Legal editor */}
        <AccordionItem value="legal" className="rounded-[18px] border border-[#E5E7EB] bg-white px-4">
          <AccordionTrigger className="text-sm font-semibold">Legal Pages</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            {LEGAL_SECTIONS.map((sec) => (
              <div key={sec.id} className="space-y-1">
                <Label className="text-xs font-semibold text-[#555555]">{sec.title}</Label>
                <Textarea
                  data-testid={`legal-edit-${sec.id}`}
                  value={legal[sec.id]?.body ?? sec.body}
                  onChange={(e) => set(`legal.${sec.id}`, { title: sec.title, body: e.target.value })}
                  rows={3}
                  className="rounded-xl text-xs"
                />
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
