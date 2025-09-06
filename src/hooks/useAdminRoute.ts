import { useLocation } from 'react-router-dom';

export function useAdminRoute() {
  const location = useLocation();
  
  const isAdminPage = location.pathname.startsWith('/admin');
  const isMainAdminPage = location.pathname === '/admin' || location.pathname === '/admin/dashboard';
  
  return {
    isAdminPage,
    isMainAdminPage,
    currentPath: location.pathname
  };
}
