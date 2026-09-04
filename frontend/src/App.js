import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Store from './pages/Store';
import AppDetail from './pages/AppDetail';
import AdminLogin from './pages/AdminLogin';
import PWAInstallBanner from './components/PWAInstallBanner';
import Analytics from './components/Analytics';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ApksPage from './pages/admin/ApksPage';
import FeaturedAppsPage from './pages/admin/FeaturedAppsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import HeroPage from './pages/admin/HeroPage';
import HomepagePage from './pages/admin/HomepagePage';
import ReviewsPage from './pages/admin/ReviewsPage';
import FaqPage from './pages/admin/FaqPage';
import LiveWinnersPage from './pages/admin/LiveWinnersPage';
import RedeemCodesPage from './pages/admin/RedeemCodesPage';
import BlogPage from './pages/admin/BlogPage';
import SeoPage from './pages/admin/SeoPage';
import SeoDashboardPage from './pages/admin/SeoDashboardPage';
import AdsPage from './pages/admin/AdsPage';
import MediaLibraryPage from './pages/admin/MediaLibraryPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import BackupPage from './pages/admin/BackupPage';
import GeneralSettingsPage from './pages/admin/SettingsPages';
import UsersPage, { SecurityPage } from './pages/admin/UsersSecurityPages';

function LegacyAppUrlRedirect() {
  const { id } = useParams();
  return <Navigate to={`/${id}`} replace />;
}

function App() {
  return (
    <div className="App">
      <HelmetProvider>
        <SettingsProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Store />} />
                <Route path="/app/:id" element={<LegacyAppUrlRedirect />} />
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
              <PWAInstallBanner />
              <Analytics />
              <Toaster position="bottom-center" offset={30} richColors />
            </BrowserRouter>
          </AuthProvider>
        </SettingsProvider>
      </HelmetProvider>
    </div>
  );
}

export default App;
