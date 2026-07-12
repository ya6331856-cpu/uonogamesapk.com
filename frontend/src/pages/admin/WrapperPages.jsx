import { PageHeader } from "@/components/admin/adminUI";
import AdminReviews from "@/components/admin/AdminReviews";
import AdminFaqs from "@/components/AdminFaqs";
import AdminWinners from "@/components/admin/AdminWinners";
import AdminCodes from "@/components/admin/AdminCodes";

export function ReviewsPage() {
  return <div><PageHeader title="Reviews" desc="Approve, edit and manage user testimonials." /><AdminReviews /></div>;
}
export function FaqPage() {
  return <div><PageHeader title="FAQ" desc="Add, edit, delete and reorder FAQs." /><AdminFaqs /></div>;
}
export function LiveWinnersPage() {
  return <div><PageHeader title="Live Winners" desc="Manage the auto-scrolling winners ticker." /><AdminWinners /></div>;
}
export function RedeemCodesPage() {
  return <div><PageHeader title="Redeem Codes" desc="Create promo codes with expiry and usage limits." /><AdminCodes /></div>;
}
