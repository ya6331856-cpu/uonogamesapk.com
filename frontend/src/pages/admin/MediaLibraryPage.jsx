import { useEffect, useRef, useState } from "react";
import { Upload, Trash2, Copy, Loader2, FileType } from "lucide-react";
import { toast } from "sonner";
import api, { resolveUrl } from "@/lib/api";
import { PageHeader, Card, Spinner } from "@/components/admin/adminUI";
import RippleButton from "@/components/RippleButton";

const isImage = (name) => /\.(png|jpe?g|webp|gif|svg|heic)$/i.test(name);
const fmtSize = (b) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${(b / 1e3).toFixed(0)} KB`);

export default function MediaLibraryPage() {
  const [files, setFiles] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const fetchFiles = async () => setFiles((await api.get("/admin/media")).data);
  useEffect(() => { fetchFiles(); }, []);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      await api.post("/admin/upload", fd);
      toast.success("Uploaded"); fetchFiles();
    } catch { toast.error("Upload failed"); } finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  };
  const remove = async (name) => { await api.delete(`/admin/media/${name}`); toast.success("Deleted"); fetchFiles(); };
  const copy = (url) => { navigator.clipboard.writeText(resolveUrl(url)); toast.success("URL copied"); };

  if (!files) return <Spinner />;
  return (
    <div>
      <PageHeader title="Media Library" desc="All uploaded icons, screenshots and APK files."
        action={<RippleButton onClick={() => inputRef.current?.click()} disabled={uploading} data-testid="media-upload-btn" className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FFB300] px-5 py-2.5 text-sm font-bold text-[#111111] shadow-[0_8px_20px_rgba(255,193,7,0.45)] disabled:opacity-60">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload</RippleButton>} />
      <input ref={inputRef} type="file" className="hidden" onChange={upload} />
      {files.length === 0 ? (
        <Card className="text-center text-sm text-[#777777]">No files uploaded yet.</Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((f) => (
            <Card key={f.filename} data-testid={`media-${f.filename}`} className="!p-2.5">
              <div className="flex h-28 items-center justify-center overflow-hidden rounded-[12px] bg-[#F8F9FA]">
                {isImage(f.filename) ? <img src={resolveUrl(f.url)} alt="" className="h-full w-full object-cover" /> : <FileType className="h-8 w-8 text-[#CCCCCC]" />}
              </div>
              <p className="mt-2 truncate text-[11px] font-medium text-[#111111]">{f.filename}</p>
              <p className="text-[10px] text-[#999999]">{fmtSize(f.size)}</p>
              <div className="mt-2 flex gap-1.5">
                <button onClick={() => copy(f.url)} className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[#F8F9FA] py-1.5 text-[11px] font-medium text-[#555555]"><Copy className="h-3 w-3" /> Copy</button>
                <button onClick={() => remove(f.filename)} data-testid={`media-delete-${f.filename}`} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F8F9FA] text-[#555555] hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
