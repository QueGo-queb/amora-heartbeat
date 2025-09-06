import { useLocation } from 'react-router-dom';
import Footer from './Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Ne pas afficher le footer sur les pages admin ET sur le dashboard utilisateur
  const shouldShowFooter = !location.pathname.startsWith('/admin') && 
                          !location.pathname.startsWith('/dashboard') &&
                          !location.pathname.startsWith('/matching') &&
                          !location.pathname.startsWith('/messages') &&
                          !location.pathname.startsWith('/profile') &&
                          !location.pathname.startsWith('/feed');
  
  return (
    <>
      {children}
      {shouldShowFooter && <Footer />}
    </>
  );
};

export default ConditionalLayout;
