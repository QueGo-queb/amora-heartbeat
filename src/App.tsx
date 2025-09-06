import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { LoaderProvider } from "@/hooks/use-loader";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Matching from "./pages/Matching";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings"; // NOUVEAU
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/dashboard";
import AdminUsers from "./pages/admin/users";
import AdminPayments from "./pages/admin/payments";
import AdminAnalytics from "./pages/admin/analytics";
import AdminModeration from "./pages/admin/moderation";
import AdminCommunication from "./pages/admin/communication";
import AdminSettings from "./pages/admin/settings";
import AdminAds from "./pages/admin/ads";
import AdminPromotions from "./pages/admin/promotions";
import AdminFooter from "./pages/admin/footer";

// Feed pages
import FeedPage from "./pages/feed";

// Premium pages
import PremiumPage from "./pages/premium";
import PremiumSuccess from "./pages/premium-success";
import PremiumFail from "./pages/premium-fail";

function App() {
  return (
    <LoaderProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <ConditionalLayout>
          <div className="App min-h-screen flex flex-col">
            <main className="flex-1">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected user routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/matching" element={
                  <ProtectedRoute>
                    <Matching />
                  </ProtectedRoute>
                } />
                <Route path="/messages" element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/feed" element={
                  <ProtectedRoute>
                    <FeedPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                
                {/* Premium routes */}
                <Route path="/premium" element={
                  <ProtectedRoute>
                    <PremiumPage />
                  </ProtectedRoute>
                } />
                <Route path="/premium-success" element={
                  <ProtectedRoute>
                    <PremiumSuccess />
                  </ProtectedRoute>
                } />
                <Route path="/premium-fail" element={
                  <ProtectedRoute>
                    <PremiumFail />
                  </ProtectedRoute>
                } />
                
                {/* Admin routes */}
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute requireAdmin>
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="/admin/payments" element={
                  <ProtectedRoute requireAdmin>
                    <AdminPayments />
                  </ProtectedRoute>
                } />
                <Route path="/admin/analytics" element={
                  <ProtectedRoute requireAdmin>
                    <AdminAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="/admin/moderation" element={
                  <ProtectedRoute requireAdmin>
                    <AdminModeration />
                  </ProtectedRoute>
                } />
                <Route path="/admin/communication" element={
                  <ProtectedRoute requireAdmin>
                    <AdminCommunication />
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute requireAdmin>
                    <AdminSettings />
                  </ProtectedRoute>
                } />
                <Route path="/admin/ads" element={
                  <ProtectedRoute requireAdmin>
                    <AdminAds />
                  </ProtectedRoute>
                } />
                <Route path="/admin/promotions" element={
                  <ProtectedRoute requireAdmin>
                    <AdminPromotions />
                  </ProtectedRoute>
                } />
                <Route path="/admin/footer" element={
                  <ProtectedRoute requireAdmin>
                    <AdminFooter />
                  </ProtectedRoute>
                } />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            
            <Toaster />
          </div>
        </ConditionalLayout>
      </Router>
    </LoaderProvider>
  );
}

export default App;
