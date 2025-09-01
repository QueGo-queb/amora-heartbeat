import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { LoaderProvider } from "@/hooks/use-loader";
import Footer from "@/components/layout/Footer";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Matching from "./pages/Matching";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
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
      <Router>
        <div className="App min-h-screen flex flex-col">
          <main className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected user routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/matching" element={<Matching />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/feed" element={<FeedPage />} />
              
              {/* Premium routes */}
              <Route path="/premium" element={<PremiumPage />} />
              <Route path="/premium-success" element={<PremiumSuccess />} />
              <Route path="/premium-fail" element={<PremiumFail />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/moderation" element={<AdminModeration />} />
              <Route path="/admin/communication" element={<AdminCommunication />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/ads" element={<AdminAds />} />
              <Route path="/admin/promotions" element={<AdminPromotions />} />
              <Route path="/admin/footer" element={<AdminFooter />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          
          {/* Footer simple - affiché sur toutes les pages */}
          <Footer />
          
          <Toaster />
        </div>
      </Router>
    </LoaderProvider>
  );
}

export default App;
