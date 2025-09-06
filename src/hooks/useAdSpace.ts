import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdSpaceConfig {
  id: string;
  is_enabled: boolean;
  title: string;
  description: string;
  updated_at: string;
}

export function useAdSpace() {
  const [config, setConfig] = useState<AdSpaceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger la configuration
  const loadConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_config')
        .select('*')
        .eq('key', 'ad_space')
        .single();

      if (error) throw error;

      if (data) {
        setConfig({
          id: data.id,
          is_enabled: data.value.is_enabled || false,
          title: data.value.title || '📢 Espace Publicitaire',
          description: data.value.description || 'Gestion des publicités depuis l\'interface admin',
          updated_at: data.updated_at
        });
      } else {
        // Configuration par défaut si elle n'existe pas
        const defaultConfig = {
          id: 'default',
          is_enabled: true,
          title: '📢 Espace Publicitaire',
          description: 'Gestion des publicités depuis l\'interface admin',
          updated_at: new Date().toISOString()
        };
        setConfig(defaultConfig);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  // Basculer l'état on/off
  const toggleAdSpace = async () => {
    if (!config) return;

    try {
      const newConfig = {
        ...config,
        is_enabled: !config.is_enabled
      };

      const { error } = await supabase
        .from('admin_config')
        .upsert({
          key: 'ad_space',
          value: newConfig,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setConfig(newConfig);
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de mise à jour');
      return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' };
    }
  };

  // Mettre à jour la configuration
  const updateConfig = async (updates: Partial<AdSpaceConfig>) => {
    if (!config) return;

    try {
      const newConfig = { ...config, ...updates };

      const { error } = await supabase
        .from('admin_config')
        .upsert({
          key: 'ad_space',
          value: newConfig,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setConfig(newConfig);
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de mise à jour');
      return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' };
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    loading,
    error,
    toggleAdSpace,
    updateConfig,
    refresh: loadConfig
  };
}
