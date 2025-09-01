import { create } from 'zustand';
import { createContext, useContext, ReactNode } from 'react';

interface LoaderState {
  isLoading: boolean;
  message: string;
  variant: 'default' | 'heart';
  showLoader: (message?: string, variant?: 'default' | 'heart') => void;
  hideLoader: () => void;
}

export const useLoader = create<LoaderState>((set) => ({
  isLoading: false,
  message: "Chargement...",
  variant: 'default',
  showLoader: (message = "Chargement...", variant = 'default') => 
    set({ isLoading: true, message, variant }),
  hideLoader: () => set({ isLoading: false }),
}));

// Context pour le LoaderProvider
const LoaderContext = createContext<LoaderState | null>(null);

// Hook pour utiliser le loader dans les composants
export const useLoaderContext = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoaderContext must be used within a LoaderProvider');
  }
  return context;
};

// Provider component
interface LoaderProviderProps {
  children: ReactNode;
}

export const LoaderProvider = ({ children }: LoaderProviderProps) => {
  return (
    <LoaderContext.Provider value={useLoader.getState()}>
      {children}
    </LoaderContext.Provider>
  );
};
