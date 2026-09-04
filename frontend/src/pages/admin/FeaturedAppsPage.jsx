import { PageHeader } from "../../components/admin/adminUI";
import AppsManager from "../../components/admin/AppsManager";

export default function FeaturedAppsPage() {
  return (
    <div>
      <PageHeader title="Featured Apps" desc="Manage the 3 pinned featured apps (position #1 is the large card)." />
      <AppsManager featuredOnly />
    </div>
  );
}
