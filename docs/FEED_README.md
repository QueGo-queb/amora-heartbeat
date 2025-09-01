# Système de Fil d'Actualité Personnalisé - AMORA

## Architecture

Le système de feed personnalisé d'AMORA utilise une approche hybride combinant :
- **Supabase** pour la persistance et l'authentification
- **API Routes Next.js** pour la logique métier côté serveur
- **React** pour l'interface utilisateur
- **Realtime** pour les mises à jour en temps réel

### Composants principaux

1. **FeedContainer** : Composant principal gérant l'état et la pagination
2. **PostCard** : Affichage individuel des posts
3. **FiltersBar** : Filtres pour personnaliser le feed
4. **API Routes** : Logique de scoring et récupération des données

## Sécurité

### RLS (Row Level Security)
- Les posts publics sont visibles par tous les utilisateurs authentifiés
- Les utilisateurs ne peuvent modifier que leurs propres posts
- Le client admin (service role) bypass RLS pour les opérations serveur

### Authentification
- Validation des tokens JWT via Supabase
- Vérification de session sur chaque requête API
- Protection contre l'accès non autorisé

## Algorithme de Scoring

Le score de pertinence est calculé selon la formule :
```
score = tagMatches * 10 + recencyScore + mutualInterestBoost + authorBoost
```

### Facteurs de scoring :
1. **TagMatches** : Nombre d'intérêts communs (×10)
2. **RecencyScore** : Score basé sur la récence (0-5)
3. **MutualInterestBoost** : Bonus pour intérêts mutuels (+5)
4. **AuthorBoost** : Bonus pour auteurs premium (+10)

## Pagination

Utilisation d'une pagination cursor-based pour de meilleures performances :
- Cursor encodé en base64 contenant `{created_at, id}`
- Chargement infini côté client
- Support de la pagination côté serveur

## Realtime

Le système utilise Supabase Realtime pour :
- Détecter les nouveaux posts
- Mettre à jour les compteurs de likes
- Notifier les utilisateurs en temps réel

## Installation et Configuration

### 1. Variables d'environnement
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Migration de base de données
```bash
# Exécuter les migrations Supabase
supabase db push

# Ou via SQL direct
psql -h your_host -U your_user -d your_db -f supabase/migrations/20250101000001_create_feed_tables.sql
```

### 3. Données de test
```bash
psql -h your_host -U your_user -d your_db -f supabase/seed_feed_data.sql
```

### 4. Politiques RLS
```bash
psql -h your_host -U your_user -d your_db -f supabase/policies.sql
```

## Tests

### Tests manuels
1. Se connecter avec un compte utilisateur
2. Naviguer vers `/feed`
3. Vérifier l'affichage des posts pertinents
4. Tester les interactions (like, commentaire)
5. Vérifier la pagination infinie
6. Tester les filtres

### Tests API
```bash
# Récupérer le feed
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/feed

# Liker un post
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/posts/POST_ID/like
```

## Optimisations recommandées

### 1. Materialized Views
Créer une vue matérialisée pour les scores de pertinence :
```sql
CREATE MATERIALIZED VIEW post_scores AS
SELECT 
  p.id,
  p.user_id,
  p.content,
  p.tags,
  p.created_at,
  -- Calcul du score ici
FROM posts p
WHERE p.visibility = 'public';
```

### 2. Cache Redis
Mettre en cache les résultats de feed pour améliorer les performances :
- Cache des posts populaires
- Cache des scores de pertinence
- Invalidation à la création de nouveaux posts

### 3. Index supplémentaires
```sql
-- Index pour les requêtes de scoring
CREATE INDEX idx_posts_scoring ON posts (created_at DESC, user_id)
  WHERE visibility = 'public';

-- Index pour les tags
CREATE INDEX idx_posts_tags_gin ON posts USING GIN (tags);
```

## Monitoring

### Métriques à surveiller
- Temps de réponse des API
- Taux de cache hit/miss
- Nombre de posts par utilisateur
- Distribution des scores de pertinence

### Logs
- Erreurs d'authentification
- Requêtes lentes
- Échecs de scoring

## Déploiement

### Production
1. Configurer les variables d'environnement
2. Exécuter les migrations
3. Vérifier les politiques RLS
4. Tester les webhooks Stripe
5. Monitorer les performances

### Environnements
- **Development** : Données de test, debug activé
- **Staging** : Données réelles, monitoring
- **Production** : Optimisations, sécurité renforcée
