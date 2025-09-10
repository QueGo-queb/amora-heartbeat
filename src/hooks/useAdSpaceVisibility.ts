import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAdSpaceVisibility() {
  const [isVisible, setIsVisible] = useState(() => {
    // Charger depuis localStorage au démarrage
    const stored = localStorage.getItem('amora_ad_space_visible');
    return stored ? JSON.parse(stored) : true;
  });
  const [loading, setLoading] = useState(false);

  const toggleAdSpaceVisibility = async (visible: boolean) => {
    try {
      console.log(`🔄 Toggling ad space visibility to: ${visible}`);
      
      // Sauvegarder dans localStorage
      localStorage.setItem('amora_ad_space_visible', JSON.stringify(visible));
      setIsVisible(visible);
      
      console.log('✅ Ad space visibility updated successfully');
      return true;
    } catch (error) {
      console.error('💥 Error in toggleAdSpaceVisibility:', error);
      return false;
    }
  };

  return {
    isVisible,
    loading,
    toggleAdSpaceVisibility,
    refresh: () => {
      const stored = localStorage.getItem('amora_ad_space_visible');
      setIsVisible(stored ? JSON.parse(stored) : true);
    }
  };
}
