/**
 * Politiques RLS pour le système d'administration
 * Sécurise l'accès aux tables d'administration et publicités
 */

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Politiques pour les publicités (ads)
-- Lecture publique : uniquement les publicités actives dans la période valide
CREATE POLICY "Ads are viewable by everyone when active" ON ads
  FOR SELECT USING (
    is_active = true 
    AND NOW() BETWEEN start_at AND end_at
  );

-- Création/modification/suppression : uniquement les admins
CREATE POLICY "Only admins can create ads" ON ads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'clodenerc@yahoo.fr')
    )
  );

CREATE POLICY "Only admins can update ads" ON ads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'clodenerc@yahoo.fr')
    )
  );

CREATE POLICY "Only admins can delete ads" ON ads
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'clodenerc@yahoo.fr')
    )
  );

-- Politiques pour les promotions
-- Lecture publique : uniquement les promotions actives
CREATE POLICY "Promotions are viewable by everyone when active" ON promotions
  FOR SELECT USING (
    is_active = true 
    AND NOW() BETWEEN start_at AND end_at
  );

-- Création/modification/suppression : uniquement les admins
CREATE POLICY "Only admins can manage promotions" ON promotions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'clodenerc@yahoo.fr')
    )
  );

-- Politiques pour le tracking des publicités
-- Lecture : uniquement les admins
CREATE POLICY "Only admins can view tracking data" ON ads_impressions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'clodenerc@yahoo.fr')
    )
  );

-- Insertion : tous les utilisateurs authentifiés peuvent enregistrer leurs impressions
CREATE POLICY "Users can record their own impressions" ON ads_impressions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Même politique pour les clics
CREATE POLICY "Only admins can view click data" ON ads_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'clodenerc@yahoo.fr')
    )
  );

CREATE POLICY "Users can record their own clicks" ON ads_clicks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour les signalements
-- Lecture : uniquement les admins
CREATE POLICY "Only admins can view reports" ON reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'clodenerc@yahoo.fr')
    )
  );

-- Insertion : tous les utilisateurs authentifiés peuvent signaler
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Modification : uniquement les admins peuvent traiter les signalements
CREATE POLICY "Only admins can update reports" ON reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'clodenerc@yahoo.fr')
    )
  );

-- Politiques spéciales pour les profils (ajout du rôle admin)
-- Permettre aux admins de voir tous les profils
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'clodenerc@yahoo.fr')
    )
  );

-- Permettre aux admins de modifier les profils
CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'clodenerc@yahoo.fr')
    )
  );

-- Note : Pour les opérations via service role (API server), 
-- le client admin bypass automatiquement RLS avec la clé service role
```

