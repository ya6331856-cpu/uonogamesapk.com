import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import Store from "@/pages/Store";
import AppDetail from "@/pages/AppDetail";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import Analytics from "@/components/Analytics";
import AdminLogin from "@/pages/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import ApksPage from "@/pages/admin/ApksPage";
import FeaturedAppsPage from "@/pages/admin/FeaturedAppsPage";
import BlogPage from "@/pages/admin/BlogPage";
import MediaLibraryPage from "@/pages/admin/MediaLibraryPage";
import BackupPage from "@/pages/admin/BackupPage";
import SeoDashboardPage from "@/pages/admin/SeoDashboardPage";
import { ReviewsPage, FaqPage, LiveWinnersPage, RedeemCodesPage } from "@/pages/admin/WrapperPages";
import {
  HeroPage, HomepagePage, CategoriesPage, SeoPage, AdsPage, NotificationsPage, GeneralSettingsPage,
} from "@/pages/admin/SettingsPages";
import { UsersPage, SecurityPage } from "@/pages/admin/UsersSecurityPages";

function App() {
  return (
    <div className="App">
      <HelmetProvider>
        <SettingsProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Store />} />
                <Route path="/app/:id" element={<AppDetail />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="apks" element={<ApksPage />} />
                  <Route path="featured-apps" element={<FeaturedAppsPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="hero" element={<HeroPage />} />
                  <Route path="homepage" element={<HomepagePage />} />
                  <Route path="reviews" element={<ReviewsPage />} />
                  <Route path="faq" element={<FaqPage />} />
                  <Route path="live-winners" element={<LiveWinnersPage />} />
                  <Route path="redeem-codes" element={<RedeemCodesPage />} />
                  <Route path="blog" element={<BlogPage />} />
                  <Route path="seo" element={<SeoPage />} />
                  <Route path="seo-dashboard" element={<SeoDashboardPage />} />
                  <Route path="ads" element={<AdsPage />} />
                  <Route path="media-library" element={<MediaLibraryPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="settings" element={<GeneralSettingsPage />} />
                  <Route path="security" element={<SecurityPage />} />
                  <Route path="backup" element={<BackupPage />} />
                </Route>
                <Route path="/:slug" element={<AppDetail />} />
              </Routes>
            </BrowserRouter>
            <PWAInstallBanner />
            <Analytics />
            <Toaster position="bottom-center" offset={80} richColors />
          </AuthProvider>
        </SettingsProvider>
      </HelmetProvider>
    </div>
  );
}

export default App;
