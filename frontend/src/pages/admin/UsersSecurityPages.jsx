import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { PageHeader, Card, Spinner } from "@/components/admin/adminUI";
import api from "@/lib/api";

export function UsersPage() {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    api.get("/admin/users")
      .then((r) => {
        const data = r.data;
        setUsers(Array.isArray(data) ? data : (data?.users || []));
      })
      .catch(() => setUsers([]));
  }, []);

  if (!users) return <Spinner />;

  return (
    <div>
      <PageHeader title="Users" desc="Admin accounts with access to this panel." />
      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id || u.email} data-testid={`admin-user-${u.id || u.email}`} className="p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#FFC107] to-[#FF9800] text-lg font-bold text-white">
                {u.name ? u.name.charAt(0).toUpperCase() : "A"}
              </span>
              <div className="flex-1">
                <p className="font-display text-sm font-semibold text-[#111111]">{u.name || "Admin"}</p>
                <p className="text-xs text-[#777777]">{u.email}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-xs font-semibold text-[#16A34A]">Active</span>
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-4 flex items-center gap-3 bg-[#F8F9FA]">
        <User className="h-5 w-5 text-[#999999]" />
        <p className="text-xs text-[#777777]">Multi-user roles &amp; granular permissions are available as an add-on.</p>
      </Card>
    </div>
  );
}

// Yeh aakhiri line add karna zaroori tha Cloudflare error hatane ke liye
export default UsersPage;
