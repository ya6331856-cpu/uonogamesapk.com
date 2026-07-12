import { useRef, useState } from "react";
import { Download, Upload, Loader2, DatabaseBackup, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { PageHeader, Card } from "@/components/admin/adminUI";
import RippleButton from "@/components/RippleButton";

export default function BackupPage() {
  const { refreshSettings } = useSettings();
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const inputRef = useRef(null);

  const doExport = async () => {
    setExporting(true);
    try {
      const { data } = await api.get("/admin/backup");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `uonogames-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded");
    } catch { toast.error("Export failed"); } finally { setExporting(false); }
  };

  const doImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoring(true);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      await api.post("/admin/backup/restore", payload);
      await refreshSettings();
      toast.success("Backup restored");
    } catch (err) { toast.error("Invalid backup file"); } finally { setRestoring(false); if (inputRef.current) inputRef.current.value = ""; }
  };

  return (
    <div>
      <PageHeader title="Backup & Restore" desc="Export your entire store or restore from a backup file." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="space-y-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#F0FDF4]"><Download className="h-5 w-5 text-[#22C55E]" /></span>
          <h3 className="font-display text-sm font-bold text-[#111111]">Export Backup</h3>
          <p className="text-xs text-[#777777]">Download apps, FAQs, reviews, winners, codes, blog and all settings as a JSON file.</p>
          <RippleButton onClick={doExport} disabled={exporting} data-testid="export-btn" className="flex items-center justify-center gap-2 rounded-full bg-[#FFC107] px-5 py-2.5 text-sm font-bold text-[#111111] disabled:opacity-60">{exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Export JSON</RippleButton>
        </Card>
        <Card className="space-y-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#FFF8E1]"><Upload className="h-5 w-5 text-[#FFB300]" /></span>
          <h3 className="font-display text-sm font-bold text-[#111111]">Restore Backup</h3>
          <p className="text-xs text-[#777777]">Upload a backup JSON to replace current data.</p>
          <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={doImport} />
          <RippleButton onClick={() => inputRef.current?.click()} disabled={restoring} data-testid="import-btn" className="flex items-center justify-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-bold text-[#111111] disabled:opacity-60">{restoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Import JSON</RippleButton>
        </Card>
      </div>
      <Card className="mt-4 flex items-start gap-3 border-amber-200 bg-amber-50">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
        <p className="text-xs text-amber-700">Restoring will overwrite existing apps, content and settings. Export a fresh backup first.</p>
      </Card>
    </div>
  );
}
