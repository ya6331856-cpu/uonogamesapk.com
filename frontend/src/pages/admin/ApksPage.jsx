import { PageHeader } from "@/components/admin/adminUI";
import AppsManager from "@/components/admin/AppsManager";

export default function ApksPage() {
  return (
    <div>
      <PageHeader title="APK Manager" desc="Add, edit, hide, tag and delete every app in your store." />
      <AppsManager />
    </div>
  );
}
