// src/hooks/useAvatar.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AvatarData {
  avatar_url: string | null;
  full_name: string;
}

export function useAvatar(userId?: string) {
  const [avatarData, setAvatarData] = useState<AvatarData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const fetchAvatar = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url, full_name')
          .eq('user_id', targetUserId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erreur récupération avatar:', error);
          return;
        }

        setAvatarData(data || null);
      } catch (error) {
        console.error('Erreur useAvatar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatar();
  }, [targetUserId]);

  const updateAvatar = (newUrl: string | null) => {
    setAvatarData(prev => prev ? { ...prev, avatar_url: newUrl } : null);
  };

  return {
    avatarUrl: avatarData?.avatar_url,
    fullName: avatarData?.full_name,
    loading,
    updateAvatar
  };
}
