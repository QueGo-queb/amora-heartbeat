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
import '@/lib/i18n';
import { useEffect, useState } from 'react';
import { BadgesPage } from "./pages/BadgesPage";
import { AIPage } from "./pages/AIPage";
import { TravelPage } from "./pages/TravelPage";

// **NOUVEAU: Import des composants d'appel**
// import { CallModal } from "@/components/chat/CallModal";
// import { useCall } from "@/hooks/useCall";
// import { callNotificationService } from "@/lib/callNotifications";

// Initialiser Sentry au démarrage
initSentry();

// **Composant pour gérer les appels globalement**
const CallManager: React.FC = () => {
  // TEMPORAIREMENT DÉSACTIVÉ
  // const { 
  //   currentCall, 
  //   incomingCall, 
  //   answerCall, 
  //   rejectCall 
  // } = useCall();
  
  // Pour l'instant, retourner null
  return null;
  
  // Le reste du composant CallManager...
};

function App() {
  // Initialiser les services avancés
  useEffect(() => {
    // Initialiser Web Vitals tracking
    initWebVitals();
    
    // Initialiser Push Notifications
    const pushService = PushNotificationService.getInstance();
    pushService.initialize();
    
    // **NOUVEAU: Initialiser les notifications d'appel**
    // callNotificationService.requestPermission().then(granted => {
    //   if (granted) {
    //     console.log('✅ Notifications d\'appel autorisées');
    //   } else {
    //     console.warn('⚠️ Notifications d\'appel refusées');
    //   }
    // });
    
    console.log('🚀 Services avancés initialisés - Système d\'appels inclus !');
  }, []);

  return (
    <ErrorBoundary>
      <QueryProvider>
        <LoaderProvider>
          <Router>
            <div className="min-h-screen bg-background">
              {/* **NOUVEAU: Gestionnaire d'appels global** */}
              <CallManager />
              
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />

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
                      <Dashboard />
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

                <Route path="/messages" element={
                  <ProtectedRoute>
                    <ConditionalLayout>
                      <Messages />
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

                <Route path="/help" element={
                  <ProtectedRoute>
                    <ConditionalLayout>
                      <HelpCenter />
                    </ConditionalLayout>
                  </ProtectedRoute>
                } />

                {/* Routes admin */}
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <ConditionalLayout>
                      <AdminDashboard />
                    </ConditionalLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/users" element={
                  <ProtectedRoute>
                    <ConditionalLayout>
                      <AdminUsers />
                    </ConditionalLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/payments" element={
                  <ProtectedRoute>
                    <ConditionalLayout>
                      <AdminPayments />
                    </ConditionalLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/analytics" element={
                  <ProtectedRoute>
                    <ConditionalLayout>
                      <AdminAnalytics />
                    </ConditionalLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/moderation" element={
                  <ProtectedRoute>
                    <ConditionalLayout>
                      <AdminModeration />
                    </ConditionalLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/communication" element={
                  <ProtectedRoute>
                    <ConditionalLayout>
                      <AdminCommunication />
                    </ConditionalLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/settings" element={
                  <ProtectedRoute>
                    <ConditionalLayout>
                      <AdminSettings />
                    </ConditionalLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/ads" element={
                  <ProtectedRoute>
                    <ConditionalLayout>
                      <AdminAds />
                    </ConditionalLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/promotions" element={
                  <ProtectedRoute>
                    <ConditionalLayout>
                      <AdminPromotions />
                    </ConditionalLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/footer" element={
                  <ProtectedRoute>
                    <ConditionalLayout>
                      <AdminFooter />
                    </ConditionalLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/legal-pages" element={
                  <ProtectedRoute>
                    <ConditionalLayout>
                      <AdminLegalPages />
                    </ConditionalLayout>
                  </ProtectedRoute>
                } />

                <Route path="/:slug" element={<LegalPage />} />

                {/* Route 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>

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
