import { ArrowUp, ArrowDown, Plus, X, Bell } from "lucide-react";
import { PageHeader, Card, Field, Area, Toggle, SaveBar, Spinner, useSettingsEditor } from "@/components/admin/adminUI";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function HeroPage() {
  const { s, set, save, saving, ready } = useSettingsEditor();
  if (!ready) return <Spinner />;
  return (
    <div>
      <PageHeader title="Hero Banner" desc="Control the top banner, headline and subtitle." action={<SaveBar onSave={save} saving={saving} testId="save-hero" />} />
      <Card className="space-y-4">
        <Toggle label="Show Hero Section" checked={s.hero?.enabled} onChange={(v) => set("hero.enabled", v)} testId="toggle-hero" />
        <Field label="Banner Image URL" testId="hero-banner" value={s.hero?.banner_url} onChange={(v) => set("hero.banner_url", v)} placeholder="/hero-banner.png or https://" />
        {s.hero?.banner_url && <img src={s.hero.banner_url.startsWith("http") ? s.hero.banner_url : s.hero.banner_url} alt="preview" className="w-full rounded-[14px] border border-[#E5E7EB]" />}
        <Field label="Headline" testId="hero-headline" value={s.hero?.headline} onChange={(v) => set("hero.headline", v)} />
        <Field label="Subtitle" testId="hero-subtitle" value={s.hero?.subtitle} onChange={(v) => set("hero.subtitle", v)} />
      </Card>
    </div>
  );
}

export function HomepagePage() {
  const { s, set, setS, save, saving, ready } = useSettingsEditor();
  if (!ready) return <Spinner />;
  const move = (i, dir) => {
    setS((prev) => {
      const next = structuredClone(prev); const arr = next.sections; const j = i + dir;
      if (j < 0 || j >= arr.length) return prev; [arr[i], arr[j]] = [arr[j], arr[i]]; return next;
    });
  };
  return (
    <div>
      <PageHeader title="Homepage Builder" desc="Reorder and toggle homepage sections, edit stats & Telegram." action={<SaveBar onSave={save} saving={saving} testId="save-homepage" />} />
      <div className="space-y-4">
        <Card>
          <h3 className="mb-3 font-display text-sm font-bold text-[#111111]">Section Order & Visibility</h3>
          <div className="space-y-2">
            {(s.sections || []).map((sec, i) => (
              <div key={sec.id} data-testid={`section-row-${sec.id}`} className="flex items-center gap-2 rounded-xl bg-[#F8F9FA] px-3 py-2">
                <span className="flex-1 text-sm font-medium text-[#111111]">{sec.label}</span>
                <label className="flex items-center gap-2 text-xs text-[#777777]">
                  <input type="checkbox" data-testid={`section-toggle-${sec.id}`} checked={sec.enabled} onChange={(e) => set(`sections.${i}.enabled`, e.target.checked)} className="h-4 w-4 accent-[#FFC107]" /> On
                </label>
                <button onClick={() => move(i, -1)} disabled={i === 0} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#555555] disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => move(i, 1)} disabled={i === s.sections.length - 1} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#555555] disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-3">
          <div className="flex items-center justify-between"><h3 className="font-display text-sm font-bold text-[#111111]">Statistics</h3></div>
          <Toggle label="Show Stats" checked={s.stats?.enabled} onChange={(v) => set("stats.enabled", v)} testId="toggle-stats" />
          {(s.stats?.items || []).map((it, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 rounded-xl bg-[#F8F9FA] p-2">
              <Field label="Label" value={it.label} onChange={(v) => set(`stats.items.${i}.label`, v)} />
              <Field label="Value" value={it.value} onChange={(v) => set(`stats.items.${i}.value`, v)} placeholder="auto" />
              <Field label="Suffix" value={it.suffix} onChange={(v) => set(`stats.items.${i}.suffix`, v)} />
            </div>
          ))}
          <p className="text-[11px] text-[#999999]">Use &quot;auto&quot; as Value for live download/verified counts.</p>
        </Card>
        <Card className="space-y-3">
          <h3 className="font-display text-sm font-bold text-[#111111]">Telegram</h3>
          <Toggle label="Show Telegram CTA" checked={s.telegram?.enabled} onChange={(v) => set("telegram.enabled", v)} testId="toggle-telegram" />
          <Field label="Channel Link" testId="tg-link" value={s.telegram?.link} onChange={(v) => set("telegram.link", v)} placeholder="https://t.me/yourchannel" />
          <Field label="CTA Text" value={s.telegram?.cta_text} onChange={(v) => set("telegram.cta_text", v)} />
          <Field label="Sub Text" value={s.telegram?.sub_text} onChange={(v) => set("telegram.sub_text", v)} />
          <Field label="Member Count" value={s.telegram?.member_count} onChange={(v) => set("telegram.member_count", v)} placeholder="50K" />
        </Card>
        <Card className="space-y-3">
          <h3 className="font-display text-sm font-bold text-[#111111]">Live Winners Ticker</h3>
          <Toggle label="Enable Ticker" checked={s.winners_config?.enabled} onChange={(v) => set("winners_config.enabled", v)} testId="toggle-winners" />
          <Field label="Scroll Speed (sec)" type="number" value={s.winners_config?.scroll_speed} onChange={(v) => set("winners_config.scroll_speed", parseInt(v) || 40)} />
        </Card>
      </div>
    </div>
  );
}

export function CategoriesPage() {
  const { s, setS, save, saving, ready } = useSettingsEditor();
  const [newCat, setNewCat] = useState("");
  if (!ready) return <Spinner />;
  const cats = s.categories || [];
  const add = () => { if (newCat.trim()) { setS((p) => ({ ...p, categories: [...(p.categories || []), newCat.trim()] })); setNewCat(""); } };
  const remove = (i) => setS((p) => ({ ...p, categories: p.categories.filter((_, idx) => idx !== i) }));
  return (
    <div>
      <PageHeader title="Categories" desc="Manage app categories used in the store filter and app form." action={<SaveBar onSave={save} saving={saving} testId="save-categories" />} />
      <Card className="space-y-4">
        <div className="flex gap-2">
          <Input data-testid="new-category" value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category name" className="rounded-xl" onKeyDown={(e) => e.key === "Enter" && add()} />
          <button onClick={add} data-testid="add-category" className="flex items-center gap-1 rounded-full bg-[#FFC107] px-4 text-sm font-bold text-[#111111]"><Plus className="h-4 w-4" /> Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {cats.map((c, i) => (
            <span key={i} data-testid={`category-chip-${c}`} className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm font-medium text-[#555555]">
              {c}<button onClick={() => remove(i)} className="text-[#999999] hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function SeoPage() {
  const { s, set, save, saving, ready } = useSettingsEditor();
  if (!ready) return <Spinner />;
  return (
    <div>
      <PageHeader title="SEO" desc="Meta tags & Open Graph applied live to the storefront." action={<SaveBar onSave={save} saving={saving} testId="save-seo" />} />
      <Card className="space-y-4">
        <Field label="Meta Title" testId="seo-title" value={s.seo?.meta_title} onChange={(v) => set("seo.meta_title", v)} />
        <Area label="Meta Description" testId="seo-desc" value={s.seo?.meta_description} onChange={(v) => set("seo.meta_description", v)} rows={2} />
        <Field label="Keywords" testId="seo-keywords" value={s.seo?.keywords} onChange={(v) => set("seo.keywords", v)} />
        <Field label="OG Image URL" value={s.seo?.og_image} onChange={(v) => set("seo.og_image", v)} />
      </Card>
    </div>
  );
}

export function AdsPage() {
  const { s, set, save, saving, ready } = useSettingsEditor();
  if (!ready) return <Spinner />;
  const ads = s.ads || {};
  return (
    <div>
      <PageHeader title="Advertisements" desc="Google AdSense or custom banner ads on the storefront." action={<SaveBar onSave={save} saving={saving} testId="save-ads" />} />
      <div className="space-y-4">
        <Card className="space-y-4">
          <Toggle label="Enable Ads" checked={ads.enabled} onChange={(v) => set("ads.enabled", v)} testId="toggle-ads" />
          <Field label="AdSense Client ID (Publisher ID)" testId="ads-client" value={ads.adsense_client} onChange={(v) => set("ads.adsense_client", v)} placeholder="ca-pub-5669686743285209" />
          <Field label="Ad Slot ID (from your AdSense ad unit)" testId="ads-slot" value={ads.adsense_slot} onChange={(v) => set("ads.adsense_slot", v)} placeholder="e.g. 1234567890" />
          <p className="rounded-xl bg-[#F0F9FF] px-3 py-2 text-xs leading-relaxed text-[#0369A1]">
            Client ID enables the ad. Leave the Slot ID empty to use responsive <b>Auto Ads</b>. To place a specific ad unit, create a Display ad unit in AdSense and paste its <b>Ad Slot ID</b> here.
          </p>
          <Area label="Custom Banner HTML (optional — overrides AdSense)" testId="ads-html" value={ads.banner_html} onChange={(v) => set("ads.banner_html", v)} rows={3} />
        </Card>

        <Card className="space-y-2">
          <h3 className="font-display text-sm font-bold text-[#111111]">Live Placeholder Preview</h3>
          <p className="text-xs text-[#777777]">This is how the ad slot appears on your storefront. Real ads fill this box once AdSense approves your live domain.</p>
          {ads.enabled ? (
            ads.banner_html ? (
              <div className="overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white" data-testid="ads-preview-html" dangerouslySetInnerHTML={{ __html: ads.banner_html }} />
            ) : (
              <div data-testid="ads-preview-box" className="flex h-24 flex-col items-center justify-center rounded-[16px] border-2 border-dashed border-[#E5E7EB] bg-[#F8F9FA] text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#B0B0B0]">Advertisement</span>
                <span className="mt-1 text-xs text-[#999999]">{ads.adsense_client ? `AdSense • ${ads.adsense_client}${ads.adsense_slot ? " • slot " + ads.adsense_slot : " • Auto Ads"}` : "Add a Client ID to activate"}</span>
              </div>
            )
          ) : (
            <div className="flex h-24 items-center justify-center rounded-[16px] border-2 border-dashed border-[#E5E7EB] bg-[#F8F9FA] text-xs text-[#999999]" data-testid="ads-preview-disabled">Ads are disabled</div>
          )}
        </Card>
      </div>
    </div>
  );
}

export function NotificationsPage() {
  const { s, set, save, saving, ready } = useSettingsEditor();
  if (!ready) return <Spinner />;
  return (
    <div>
      <PageHeader title="Notifications" desc="Site-wide announcement bar shown above the header." action={<SaveBar onSave={save} saving={saving} testId="save-notifications" />} />
      <Card className="space-y-4">
        <Toggle label="Show Announcement Bar" checked={s.announcement?.enabled} onChange={(v) => set("announcement.enabled", v)} testId="toggle-announcement" />
        <Field label="Announcement Text" testId="announcement-text" value={s.announcement?.text} onChange={(v) => set("announcement.text", v)} />
        <Field label="Link (optional)" value={s.announcement?.link} onChange={(v) => set("announcement.link", v)} />
      </Card>
      <Card className="mt-4 flex items-center gap-3 bg-[#F8F9FA]">
        <Bell className="h-5 w-5 text-[#999999]" />
        <p className="text-xs text-[#777777]">Web push notifications require a push provider (e.g. Firebase/OneSignal) — reach out to enable this add-on.</p>
      </Card>
    </div>
  );
}

export function GeneralSettingsPage() {
  const { s, set, save, saving, ready } = useSettingsEditor();
  if (!ready) return <Spinner />;
  return (
    <div>
      <PageHeader title="Settings" desc="Branding, contact details, social links and theme." action={<SaveBar onSave={save} saving={saving} testId="save-settings" />} />
      <div className="space-y-4">
        <Card className="space-y-3">
          <h3 className="font-display text-sm font-bold text-[#111111]">Branding</h3>
          <Field label="Site Name" testId="set-sitename" value={s.branding?.site_name} onChange={(v) => set("branding.site_name", v)} />
          <Field label="Logo Text" value={s.branding?.logo_text} onChange={(v) => set("branding.logo_text", v)} />
          <Field label="Logo Image URL" value={s.branding?.logo_url} onChange={(v) => set("branding.logo_url", v)} />
          <Field label="Favicon URL" value={s.branding?.favicon_url} onChange={(v) => set("branding.favicon_url", v)} />
          <Field label="Footer Text" value={s.branding?.footer_text} onChange={(v) => set("branding.footer_text", v)} />
          <Field label="Copyright" value={s.branding?.copyright} onChange={(v) => set("branding.copyright", v)} />
        </Card>
        <Card className="space-y-3">
          <h3 className="font-display text-sm font-bold text-[#111111]">Contact & Social</h3>
          <Field label="Support Email" value={s.contact?.email} onChange={(v) => set("contact.email", v)} />
          <Field label="Instagram URL" value={s.contact?.instagram} onChange={(v) => set("contact.instagram", v)} />
          <Field label="YouTube URL" value={s.contact?.youtube} onChange={(v) => set("contact.youtube", v)} />
          <Field label="Twitter/X URL" value={s.contact?.twitter} onChange={(v) => set("contact.twitter", v)} />
        </Card>
        <Card className="space-y-3">
          <h3 className="font-display text-sm font-bold text-[#111111]">Theme Colors</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs font-semibold text-[#555555]">Primary</Label><div className="flex gap-2"><input type="color" value={s.theme?.primary || "#FFC107"} onChange={(e) => set("theme.primary", e.target.value)} className="h-10 w-12 rounded-lg border border-[#E5E7EB]" /><Input value={s.theme?.primary} onChange={(e) => set("theme.primary", e.target.value)} className="rounded-xl" /></div></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold text-[#555555]">Secondary</Label><div className="flex gap-2"><input type="color" value={s.theme?.secondary || "#FFB300"} onChange={(e) => set("theme.secondary", e.target.value)} className="h-10 w-12 rounded-lg border border-[#E5E7EB]" /><Input value={s.theme?.secondary} onChange={(e) => set("theme.secondary", e.target.value)} className="rounded-xl" /></div></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
