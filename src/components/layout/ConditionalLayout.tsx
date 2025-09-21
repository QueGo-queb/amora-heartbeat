import { useLocation } from 'react-router-dom';
import Footer from './Footer';
import SidebarLayout from './SidebarLayout';
import { useLanguage } from '@/contexts/LanguageContext'; // ✅ AJOUT

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { selectedLanguage } = useLanguage(); // ✅ AJOUT
  
  // Pages qui utilisent le nouveau layout avec menu latéral
  const useDatingLayout = location.pathname.startsWith('/dashboard') ||
                         location.pathname.startsWith('/matching') ||
                         location.pathname.startsWith('/messages') ||
                         location.pathname.startsWith('/profile') ||
                         location.pathname.startsWith('/feed') ||
                         location.pathname.startsWith('/events') ||
                         location.pathname.startsWith('/badges') ||
                         location.pathname.startsWith('/ai') ||
                         location.pathname.startsWith('/travel') ||
                         location.pathname.startsWith('/premium') ||
                         location.pathname.startsWith('/notifications') ||
                         location.pathname.startsWith('/profile-views') ||
                         location.pathname.startsWith('/unread-messages') ||
                         location.pathname.startsWith('/new-matches') ||
                         location.pathname.startsWith('/help') ||
                         // ✅ AJOUT - Toutes les pages manquantes
                         location.pathname.startsWith('/likes') ||
                         location.pathname.startsWith('/chat-live') ||
                         location.pathname.startsWith('/favorites') ||
                         location.pathname.startsWith('/video-chat') ||
                         location.pathname.startsWith('/my-posts') ||
                         location.pathname.startsWith('/settings');
  
  // Pages admin gardent leur layout actuel
  const isAdminPage = location.pathname.startsWith('/admin');
  
  // Pages publiques (accueil, auth, etc.)
  const isPublicPage = location.pathname === '/' || 
                      location.pathname.startsWith('/auth') ||
                      location.pathname.startsWith('/legal');
  
  // Ne pas afficher le footer sur les pages avec layout spécial
  const shouldShowFooter = !useDatingLayout && !isAdminPage && !isPublicPage;
  
  if (useDatingLayout) {
    return (
      <SidebarLayout>
        {children}
      </SidebarLayout>
    );
  }
  
  return (
    <>
      {children}
      {shouldShowFooter && <Footer language={selectedLanguage} />} {/* ✅ CORRECTION */}
    </>
  );
};

export default ConditionalLayout;
