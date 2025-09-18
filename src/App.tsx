import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { LoaderProvider } from "@/hooks/use-loader";
import { initSentry, trackError } from "@/lib/sentry";
import ErrorBoundary from "@/components/ErrorBoundary";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Matching from "./pages/Matching";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Feed from "./pages/feed";
import MyPosts from "./pages/MyPosts";

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
import AdminLegalPages from "./pages/admin/legal-pages";
import LegalPage from "./pages/LegalPage";

// Events pages
import { EventsPage } from "./pages/EventsPage";

// Premium pages
import PremiumPage from "./pages/premium";
import PremiumSuccess from "./pages/premium-success";
import PremiumFail from "./pages/premium-fail";

// Nouvelles routes avec boutons de retour
import NewMatches from "./pages/NewMatches";
import UnreadMessages from "./pages/UnreadMessages";
import ProfileViews from "./pages/ProfileViews";
import HelpCenter from "./pages/HelpCenter";
import Notifications from "./pages/Notifications";

import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { NetworkStatus } from '@/components/pwa/NetworkStatus';
import { QueryProvider } from "@/providers/QueryProvider";
import { initWebVitals } from '@/lib/webVitals';
import { PushNotificationService } from '@/lib/pushNotifications';
import { useEffect, useState } from 'react';
import { BadgesPage } from "./pages/BadgesPage";
import { AIPage } from "./pages/AIPage";
import { TravelPage } from "./pages/TravelPage";
import Favorites from "./pages/Favorites";
import VideoChat from "./pages/VideoChat";
import UpdateNotification from '@/components/pwa/UpdateNotification';
import ConversationDetail from "./pages/ConversationDetail";

// ✅ AJOUT - Import des pages manquantes
import Likes from "./pages/Likes";
import ChatLive from "./pages/ChatLive";
import Onboarding from "./pages/Onboarding";

// **NOUVEAU: Import des composants d'appel**
import { CallModal } from "@/components/chat/CallModal";
import { useCall } from "@/hooks/useCall";

// Initialiser Sentry au démarrage
initSentry();

// 🔧 COMPOSANT INTERNE QUI UTILISE LES HOOKS ROUTER
const AppRoutes = () => {
  // ✅ MAINTENANT DANS LE CONTEXTE ROUTER - Hook useCall
  const { currentCall, incomingCall } = useCall();
  const [showCallModal, setShowCallModal] = useState(false);

  // ✅ Modal d'appel
  useEffect(() => {
    if (currentCall || incomingCall) {
      setShowCallModal(true);
    } else {
      setShowCallModal(false);
    }
  }, [currentCall, incomingCall]);

  return (
    <>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Route onboarding - protégée mais accessible avec compte pending */}
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />

        {/* Routes protégées */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <Dashboard />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/feed" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <Feed />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        {/* ✅ AJOUT - Route pour Mes Publications */}
        <Route path="/my-posts" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <MyPosts />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/matching" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <Matching />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        {/* Route pour les messages */}
        <Route path="/messages" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <Messages />
            </ConditionalLayout>
          </ProtectedRoute>
        } />
        
        {/* Route pour les conversations individuelles */}
        <Route path="/messages/:id" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <ConversationDetail />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <Profile />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <Settings />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <Notifications />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        {/* **Nouvelles routes pour modules avancés** */}
        <Route path="/events" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <EventsPage />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/badges" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <BadgesPage />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/ai" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <AIPage />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/travel" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <TravelPage />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        {/* Routes premium */}
        <Route path="/premium" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <PremiumPage />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/premium-success" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <PremiumSuccess />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/premium-fail" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <PremiumFail />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        {/* Routes avec boutons de retour */}
        <Route path="/new-matches" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <NewMatches />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/unread-messages" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <UnreadMessages />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile-views" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <ProfileViews />
            </ConditionalLayout>
          </ProtectedRoute>
        } />
        
        {/* ✅ AJOUT - Route pour la page J'aime */}
        <Route path="/likes" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <Likes />
            </ConditionalLayout>
          </ProtectedRoute>
        } />
        
        {/* ✅ AJOUT - Route pour Chat en ligne */}
        <Route path="/chat-live" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <ChatLive />
            </ConditionalLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/help" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <HelpCenter />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        {/* Routes admin - 🔧 AJOUT requireAdmin */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <ConditionalLayout>
              <AdminDashboard />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/users" element={
          <ProtectedRoute requireAdmin={true}>
            <ConditionalLayout>
              <AdminUsers />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/payments" element={
          <ProtectedRoute requireAdmin={true}>
            <ConditionalLayout>
              <AdminPayments />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/analytics" element={
          <ProtectedRoute requireAdmin={true}>
            <ConditionalLayout>
              <AdminAnalytics />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/moderation" element={
          <ProtectedRoute requireAdmin={true}>
            <ConditionalLayout>
              <AdminModeration />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/communication" element={
          <ProtectedRoute requireAdmin={true}>
            <ConditionalLayout>
              <AdminCommunication />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/settings" element={
          <ProtectedRoute requireAdmin={true}>
            <ConditionalLayout>
              <AdminSettings />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/ads" element={
          <ProtectedRoute requireAdmin={true}>
            <ConditionalLayout>
              <AdminAds />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/promotions" element={
          <ProtectedRoute requireAdmin={true}>
            <ConditionalLayout>
              <AdminPromotions />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/footer" element={
          <ProtectedRoute requireAdmin={true}>
            <ConditionalLayout>
              <AdminFooter />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/legal-pages" element={
          <ProtectedRoute requireAdmin={true}>
            <ConditionalLayout>
              <AdminLegalPages />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/favorites" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <Favorites />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/video-chat" element={
          <ProtectedRoute>
            <ConditionalLayout>
              <VideoChat />
            </ConditionalLayout>
          </ProtectedRoute>
        } />

        <Route path="/:slug" element={<LegalPage />} />

        {/* Route 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* ✅ RÉACTIVÉ - Modal d'appel global */}
      <CallModal 
        open={showCallModal} 
        onOpenChange={setShowCallModal} 
      />
    </>
  );
};

function App() {
  // Initialiser les services avancés
  useEffect(() => {
    // Initialiser Web Vitals tracking
    initWebVitals();
    
    // Initialiser Push Notifications
    const pushService = PushNotificationService.getInstance();
    pushService.initialize();
    
    console.log('🚀 Services avancés initialisés');
  }, []);

  return (
    <ErrorBoundary>
      <QueryProvider>
        <LoaderProvider>
          <Router>
            <div className="min-h-screen bg-background">
              
              {/* Notification de mise à jour PWA */}
              <UpdateNotification />
              
              {/* 🔧 COMPOSANT AVEC HOOKS ROUTER */}
              <AppRoutes />

              {/* Composants PWA globaux */}
              <InstallPrompt />
              <NetworkStatus />
              
              {/* Toast notifications */}
              <Toaster />
            </div>
          </Router>
        </LoaderProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
