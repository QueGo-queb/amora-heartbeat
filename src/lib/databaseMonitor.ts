/**
 * ✅ MONITORING DES PERFORMANCES DE LA BASE DE DONNÉES
 */

import { supabase } from '@/integrations/supabase/client';

interface DatabaseStats {
  tableName: string;
  rowCount: number;
  tableSize: string;
  indexSize: string;
}

interface QueryPerformance {
  query: string;
  avgTime: number;
  callCount: number;
  totalTime: number;
}

class DatabaseMonitor {
  private static instance: DatabaseMonitor;
  private queryTimes: Map<string, number[]> = new Map();
  private slowQueries: QueryPerformance[] = [];

  static getInstance(): DatabaseMonitor {
    if (!DatabaseMonitor.instance) {
      DatabaseMonitor.instance = new DatabaseMonitor();
    }
    return DatabaseMonitor.instance;
  }

  // Mesurer le temps d'exécution d'une requête
  async measureQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await queryFn();
      const end = performance.now();
      const duration = end - start;
      
      // Enregistrer le temps d'exécution
      this.recordQueryTime(queryName, duration);
      
      // Logger les requêtes lentes
      if (duration > 1000) { // Plus de 1 seconde
        console.warn(`�� Requête lente détectée: ${queryName} (${duration.toFixed(2)}ms)`);
      }
      
      return result;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;
      
      console.error(`❌ Erreur requête ${queryName}:`, error);
      this.recordQueryTime(queryName, duration);
      
      throw error;
    }
  }

  private recordQueryTime(queryName: string, duration: number): void {
    const times = this.queryTimes.get(queryName) || [];
    times.push(duration);
    
    // Garder seulement les 100 dernières mesures
    if (times.length > 100) {
      times.splice(0, times.length - 100);
    }
    
    this.queryTimes.set(queryName, times);
  }

  // Obtenir les statistiques de performance
  getQueryStats(): QueryPerformance[] {
    const stats: QueryPerformance[] = [];
    
    for (const [queryName, times] of this.queryTimes.entries()) {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const totalTime = times.reduce((sum, time) => sum + time, 0);
      
      stats.push({
        query: queryName,
        avgTime,
        callCount: times.length,
        totalTime
      });
    }
    
    return stats.sort((a, b) => b.avgTime - a.avgTime);
  }

  // Obtenir les statistiques de la base de données
  async getDatabaseStats(): Promise<DatabaseStats[]> {
    try {
      const { data, error } = await supabase.rpc('get_performance_stats');
      
      if (error) {
        console.error('Erreur récupération stats DB:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erreur monitoring DB:', error);
      return [];
    }
  }

  // Nettoyer les données anciennes
  async cleanupOldData(): Promise<void> {
    try {
      const { error } = await supabase.rpc('cleanup_old_data');
      
      if (error) {
        console.error('Erreur nettoyage données:', error);
      } else {
        console.log('✅ Nettoyage des données anciennes terminé');
      }
    } catch (error) {
      console.error('Erreur nettoyage:', error);
    }
  }

  // Rafraîchir les vues matérialisées
  async refreshMaterializedViews(): Promise<void> {
    try {
      const { error } = await supabase.rpc('refresh_user_stats');
      
      if (error) {
        console.error('Erreur rafraîchissement vues:', error);
      } else {
        console.log('✅ Vues matérialisées rafraîchies');
      }
    } catch (error) {
      console.error('Erreur rafraîchissement:', error);
    }
  }

  // Obtenir les requêtes les plus lentes
  getSlowQueries(threshold: number = 1000): QueryPerformance[] {
    return this.getQueryStats().filter(stat => stat.avgTime > threshold);
  }

  // Réinitialiser les statistiques
  resetStats(): void {
    this.queryTimes.clear();
    this.slowQueries = [];
  }
}

export const databaseMonitor = DatabaseMonitor.getInstance();

// Hook pour utiliser le monitoring de la base de données
export const useDatabaseMonitor = () => {
  return {
    measureQuery: <T>(queryName: string, queryFn: () => Promise<T>) =>
      databaseMonitor.measureQuery(queryName, queryFn),
    
    getQueryStats: () => databaseMonitor.getQueryStats(),
    getDatabaseStats: () => databaseMonitor.getDatabaseStats(),
    getSlowQueries: (threshold?: number) => databaseMonitor.getSlowQueries(threshold),
    cleanupOldData: () => databaseMonitor.cleanupOldData(),
    refreshMaterializedViews: () => databaseMonitor.refreshMaterializedViews(),
    resetStats: () => databaseMonitor.resetStats()
  };
};
