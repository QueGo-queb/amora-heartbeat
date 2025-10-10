# 🔐 Guide de Sécurisation - Projet Amora

**Version**: 1.0.3  
**Date de mise à jour**: 10 octobre 2025  
**Statut**: ✅ Sécurisé pour production

---

## ⚠️ AVANT DE DÉPLOYER EN PRODUCTION

### 1. Configuration des Variables d'Environnement

#### Créer le fichier `.env` à la racine du projet

```bash
# Copier le template
cp env.example .env
```

#### Remplir les valeurs OBLIGATOIRES

```env
# ✅ Supabase (OBLIGATOIRE)
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key_ici

# ⚠️ Service Role (SERVEUR UNIQUEMENT - NE JAMAIS EXPOSER)
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici

# ✅ Stripe (pour les paiements)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_stripe

# ✅ Sentry (monitoring d'erreurs)
VITE_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=votre_token_sentry

# ✅ Environnement
NODE_ENV=production
VITE_APP_ENV=production
```

### 2. Vérifications de Sécurité

#### ✅ Checklist Pré-déploiement

- [ ] Le fichier `.env` n'est PAS versionné dans Git
- [ ] Le fichier `.gitignore` contient bien `.env`
- [ ] Aucune clé hardcodée dans le code source
- [ ] La Service Role Key n'est utilisée QUE côté serveur
- [ ] Les console.log de production sont désactivés
- [ ] Les variables d'environnement sont configurées sur l'hébergeur

#### 🔍 Commandes de vérification

```bash
# Vérifier qu'aucune clé n'est hardcodée
grep -r "supabase\.co" src/ --exclude-dir=node_modules

# Vérifier .gitignore
cat .gitignore | grep .env

# Vérifier le build
npm run build

# Tester en mode production local
npm run preview
```

---

## 🛡️ BONNES PRATIQUES DE SÉCURITÉ

### 1. Gestion des Clés API

#### ❌ NE JAMAIS FAIRE

```typescript
// ❌ MAUVAIS - Clé hardcodée
const supabaseUrl = 'https://mon-projet.supabase.co';
const supabaseKey = 'eyJhbGc...'; // NE JAMAIS FAIRE ÇA !
```

#### ✅ TOUJOURS FAIRE

```typescript
// ✅ BON - Depuis variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ Avec validation
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variables d\'environnement manquantes');
}
```

### 2. Séparation Client/Serveur

#### ⚠️ Service Role Key (côté serveur UNIQUEMENT)

```typescript
// ✅ Protection contre utilisation côté client
if (typeof window !== 'undefined') {
  throw new Error('Ce module ne peut être utilisé que côté serveur');
}

// ✅ Charger depuis process.env (Node.js)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
```

#### ✅ Anon Key (côté client)

```typescript
// ✅ Utilisable côté client
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### 3. Logging Sécurisé

#### Utiliser l'utilitaire devLogger

```typescript
import { devLog } from '@/lib/devLogger';

// ✅ Log visible uniquement en développement
devLog.log('Debug info:', data);

// ✅ Erreurs toujours affichées (même en production)
devLog.error('Erreur critique:', error);
```

#### Ne jamais logger d'informations sensibles

```typescript
// ❌ MAUVAIS
console.log('Token:', user.access_token);
console.log('Password:', password);

// ✅ BON
devLog.log('User logged in:', user.id);
```

---

## 🚀 DÉPLOIEMENT

### 1. Configuration Vercel (Recommandé)

#### Ajouter les variables d'environnement

```bash
# Via CLI
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY

# Ou via Dashboard Vercel
# Settings > Environment Variables
```

#### Configuration `vercel.json`

```json
{
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "VITE_APP_ENV": "production"
    }
  }
}
```

### 2. Configuration Netlify

#### `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_ENV = "production"
  VITE_APP_ENV = "production"

# Les autres variables via Netlify Dashboard
# Site settings > Environment variables
```

### 3. Configuration Docker

#### `Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Ne PAS copier .env dans l'image Docker
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Variables d'environnement passées au runtime
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 🔐 GESTION DES SECRETS

### 1. Rotation des Clés

#### Quand changer les clés ?

- **Immédiatement** si une clé est compromise
- **Tous les 90 jours** pour les clés sensibles (Service Role)
- **Après départ d'un développeur** ayant eu accès

#### Comment rotater les clés Supabase

1. Aller dans Supabase Dashboard > Settings > API
2. Cliquer sur "Generate new anon key"
3. Mettre à jour `.env` local et variables d'environnement hébergeur
4. Redéployer l'application
5. Invalider l'ancienne clé après confirmation

### 2. Accès aux Secrets

#### Qui peut accéder aux secrets ?

- **Service Role Key**: Uniquement les administrateurs système
- **Anon Key**: Tous les développeurs
- **Stripe Keys**: Uniquement l'équipe finance + admins
- **Sentry Tokens**: Uniquement l'équipe DevOps

#### Outils recommandés

- **1Password**: Partage sécurisé d'équipe
- **AWS Secrets Manager**: Pour production
- **HashiCorp Vault**: Pour grandes équipes
- **Vercel/Netlify Env Vars**: Intégré à la plateforme

---

## 📋 CHECKLIST DE SÉCURITÉ COMPLÈTE

### Avant Chaque Déploiement

- [ ] `.env` non versionné dans Git
- [ ] Toutes les variables d'environnement configurées
- [ ] Build de production réussi sans erreurs
- [ ] Aucun console.log sensible en production
- [ ] Types TypeScript sans erreurs
- [ ] Tests E2E passent
- [ ] Audit de sécurité npm (`npm audit`)

### Configuration Serveur

- [ ] HTTPS activé (certificat SSL valide)
- [ ] Headers de sécurité configurés
- [ ] CORS correctement configuré
- [ ] Rate limiting en place
- [ ] Monitoring d'erreurs actif (Sentry)
- [ ] Backups automatiques configurés

### Supabase

- [ ] RLS (Row Level Security) activé
- [ ] Policies correctement configurées
- [ ] Service Role Key protégée
- [ ] Auth providers configurés
- [ ] Storage policies définies

### Monitoring

- [ ] Sentry intégré et fonctionnel
- [ ] Logs d'erreurs routés correctement
- [ ] Alertes configurées
- [ ] Dashboard de monitoring accessible

---

## 🆘 EN CAS DE COMPROMISSION

### Si une clé API est exposée

1. **IMMÉDIATEMENT**: Révoquer la clé dans Supabase/Stripe Dashboard
2. Générer une nouvelle clé
3. Mettre à jour toutes les instances (local, staging, production)
4. Auditer les logs d'accès pour détecter une utilisation malveillante
5. Informer l'équipe
6. Documenter l'incident

### Contacts d'urgence

- **Équipe DevOps**: [votre-email@amora.com]
- **Supabase Support**: support@supabase.io
- **Stripe Support**: support@stripe.com

---

## 📚 RESSOURCES

### Documentation

- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### Outils de Sécurité

- `npm audit`: Audit des dépendances
- `snyk`: Analyse de vulnérabilités
- `lighthouse`: Audit de sécurité web

---

*Document maintenu par l'équipe Amora - Dernière mise à jour: 10/10/2025*

