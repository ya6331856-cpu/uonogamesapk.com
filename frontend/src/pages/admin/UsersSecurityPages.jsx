import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageHeader, Card, Field, SaveBar, Spinner } from "@/components/admin/adminUI";

export function UsersPage() {
  const [users, setUsers] = useState(null);
  useEffect(() => { api.get("/admin/users").then((r) => setUsers(r.data)).catch(() => setUsers([])); }, []);
  if (!users) return <Spinner />;
  return (
    <div>
      <PageHeader title="Users" desc="Admin accounts with access to this panel." />
      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id} data-testid={`admin-user-${u.id}`} className="!p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#FFC107] to-[#FFB300] font-display text-base font-bold text-white">{(u.email || "A").charAt(0).toUpperCase()}</span>
              <div className="flex-1">
                <p className="font-display text-sm font-semibold text-[#111111]">{u.name || "Admin"}</p>
                <p className="text-xs text-[#777777]">{u.email}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-xs font-semibold text-[#22C55E]"><ShieldCheck className="h-3.5 w-3.5" /> {u.role}</span>
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-4 flex items-center gap-3 bg-[#F8F9FA]">
        <User className="h-5 w-5 text-[#999999]" />
        <p className="text-xs text-[#777777]">Multi-user roles &amp; granular permissions are available as an add-on. Contact us to enable additional admin seats.</p>
      </Card>
    </div>
  );
}

export function SecurityPage() {
  const [form, setForm] = useState({ current: "", new: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async () => {
    if (form.new !== form.confirm) { toast.error("Passwords do not match"); return; }
    if (form.new.length < 6) { toast.error("New password must be at least 6 characters"); return; }
    setSaving(true);
    try {
      await api.put("/admin/password", { current: form.current, new: form.new });
      toast.success("Password updated");
      setForm({ current: "", new: "", confirm: "" });
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); } finally { setSaving(false); }
  };
  return (
    <div>
      <PageHeader title="Security" desc="Change your admin password." />
      <Card className="max-w-md space-y-4">
        <Field label="Current Password" type="password" testId="sec-current" value={form.current} onChange={(v) => setField("current", v)} />
        <Field label="New Password" type="password" testId="sec-new" value={form.new} onChange={(v) => setField("new", v)} />
        <Field label="Confirm New Password" type="password" testId="sec-confirm" value={form.confirm} onChange={(v) => setField("confirm", v)} />
        <SaveBar onSave={submit} saving={saving} testId="save-password" />
      </Card>
    </div>
  );
}
