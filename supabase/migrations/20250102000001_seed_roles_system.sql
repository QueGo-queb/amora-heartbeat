-- Insérer les rôles par défaut
INSERT INTO roles (name, display_name, description) VALUES
('user', 'Utilisateur', 'Utilisateur standard de la plateforme'),
('premium', 'Premium', 'Utilisateur avec abonnement premium'),
('moderator', 'Modérateur', 'Peut modérer le contenu et les utilisateurs'),
('admin', 'Administrateur', 'Accès complet à l''administration'),
('super_admin', 'Super Admin', 'Accès système complet et gestion des admins');

-- Insérer les permissions
INSERT INTO permissions (name, display_name, description) VALUES
('read_users', 'Lire Utilisateurs', 'Peut consulter les profils utilisateurs'),
('write_users', 'Modifier Utilisateurs', 'Peut modifier les profils utilisateurs'),
('delete_users', 'Supprimer Utilisateurs', 'Peut supprimer des comptes utilisateurs'),
('read_posts', 'Lire Publications', 'Peut consulter toutes les publications'),
('write_posts', 'Modifier Publications', 'Peut modifier les publications'),
('delete_posts', 'Supprimer Publications', 'Peut supprimer des publications'),
('moderate_content', 'Modérer Contenu', 'Peut modérer le contenu signalé'),
('manage_payments', 'Gérer Paiements', 'Peut gérer les transactions et abonnements'),
('view_analytics', 'Voir Analytics', 'Peut consulter les statistiques'),
('manage_ads', 'Gérer Publicités', 'Peut créer et gérer les publicités'),
('manage_promotions', 'Gérer Promotions', 'Peut créer et gérer les promotions'),
('manage_system', 'Gérer Système', 'Peut modifier les paramètres système'),
('super_admin_access', 'Accès Super Admin', 'Accès complet au système');

-- Assigner les permissions aux rôles

-- Utilisateur standard
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'user' AND p.name IN ('read_posts');

-- Utilisateur premium  
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'premium' AND p.name IN ('read_posts', 'read_users');

-- Modérateur
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'moderator' AND p.name IN (
  'read_posts', 'read_users', 'write_posts', 'delete_posts', 'moderate_content'
);

-- Administrateur
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin' AND p.name IN (
  'read_users', 'write_users', 'delete_users',
  'read_posts', 'write_posts', 'delete_posts',
  'moderate_content', 'manage_payments', 'view_analytics',
  'manage_ads', 'manage_promotions'
);

-- Super Admin (toutes les permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'super_admin';

-- Assigner le rôle super_admin à l'utilisateur existant
-- REMPLACEZ 'clodenerc@yahoo.fr' par l'email réel ou l'UUID
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'clodenerc@yahoo.fr'),
  (SELECT id FROM roles WHERE name = 'super_admin'),
  (SELECT id FROM auth.users WHERE email = 'clodenerc@yahoo.fr')
WHERE EXISTS (SELECT 1 FROM auth.users WHERE email = 'clodenerc@yahoo.fr');
