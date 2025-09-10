-- Migration pour créer le système de pages légales éditables
-- Tables pour gérer toutes les pages légales depuis l'interface admin

-- Table pour les pages légales
CREATE TABLE IF NOT EXISTS legal_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  category TEXT NOT NULL DEFAULT 'legal' CHECK (category IN ('legal', 'support', 'company')),
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer toutes les pages légales par défaut
INSERT INTO legal_pages (slug, title, content, meta_description, category, order_index) VALUES
-- Pages légales
('terms-of-service', 'Conditions d''utilisation', 
'# Conditions d''utilisation d''Amora

## 1. Acceptation des conditions
En utilisant Amora, vous acceptez ces conditions d''utilisation. Si vous n''acceptez pas ces termes, veuillez ne pas utiliser notre service.

## 2. Description du service
Amora est une plateforme de rencontres en ligne qui permet aux utilisateurs de se connecter et de communiquer.

## 3. Responsabilités de l''utilisateur
- Vous devez avoir au moins 18 ans pour utiliser Amora
- Vous êtes responsable de la confidentialité de votre compte
- Vous acceptez de ne pas publier de contenu inapproprié

## 4. Politique de confidentialité
Nous respectons votre vie privée. Consultez notre politique de confidentialité pour plus d''informations.

## 5. Modifications des conditions
Nous nous réservons le droit de modifier ces conditions à tout moment.

*Dernière mise à jour : ' || CURRENT_DATE || '*', 
'Conditions d''utilisation de la plateforme Amora - Règles et responsabilités des utilisateurs', 'legal', 1),

('privacy-policy', 'Politique de confidentialité',
'# Politique de confidentialité

## 1. Collecte d''informations
Nous collectons les informations que vous nous fournissez lors de l''inscription et de l''utilisation de notre service.

## 2. Utilisation des données
- Améliorer nos services
- Personnaliser votre expérience
- Communiquer avec vous
- Sécuriser notre plateforme

## 3. Partage des données
Nous ne vendons pas vos données personnelles à des tiers.

## 4. Sécurité
Nous utilisons des mesures de sécurité appropriées pour protéger vos informations.

## 5. Vos droits
Vous avez le droit d''accéder, modifier ou supprimer vos données.

*Dernière mise à jour : ' || CURRENT_DATE || '*',
'Politique de confidentialité d''Amora - Protection de vos données personnelles', 'legal', 2),

('cookies-policy', 'Politique des cookies',
'# Politique des cookies

## Qu''est-ce qu''un cookie ?
Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez notre site.

## Types de cookies utilisés
- **Cookies essentiels** : Nécessaires au fonctionnement du site
- **Cookies analytiques** : Pour améliorer nos services
- **Cookies de préférences** : Pour mémoriser vos choix

## Gestion des cookies
Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.

*Dernière mise à jour : ' || CURRENT_DATE || '*',
'Politique des cookies - Comment nous utilisons les cookies sur Amora', 'legal', 3),

('legal-notices', 'Mentions légales',
'# Mentions légales

## Éditeur du site
**Amora**  
Plateforme de rencontres en ligne

## Hébergement
Supabase Inc.  
970 Toa Payoh North #07-04  
Singapore 318992

## Propriété intellectuelle
Tous les contenus présents sur ce site sont protégés par le droit d''auteur.

## Contact
Email : contact@amora.com  
Pour toute question juridique : legal@amora.com

*Dernière mise à jour : ' || CURRENT_DATE || '*',
'Mentions légales d''Amora - Informations juridiques et contacts', 'legal', 4),

-- Pages de support
('about', 'À propos',
'# À propos d''Amora

## Notre mission
Amora révolutionne les rencontres en ligne en créant des connexions authentiques basées sur la compatibilité réelle.

## Notre vision
Nous croyons que chaque personne mérite de trouver l''amour véritable.

## Nos valeurs
- **Authenticité** : Encourager les vraies connexions
- **Sécurité** : Protéger nos utilisateurs
- **Inclusion** : Accueillir tout le monde
- **Innovation** : Améliorer constamment l''expérience

## L''équipe
Une équipe passionnée dédiée à créer la meilleure expérience de rencontres.

*Rejoignez-nous dans cette aventure !*',
'Découvrez Amora - Notre mission, vision et valeurs pour révolutionner les rencontres', 'company', 1),

('how-matching-works', 'Comment fonctionne le matching',
'# Comment fonctionne notre système de matching

## Algorithme intelligent
Notre algorithme analyse plusieurs facteurs pour vous proposer des profils compatibles :

### 1. Critères de base
- Âge et localisation
- Préférences de genre
- Objectifs relationnels

### 2. Compatibilité des intérêts
- Hobbies partagés
- Style de vie
- Valeurs communes

### 3. Score de compatibilité
Un pourcentage indique votre niveau de compatibilité avec chaque profil.

## Conseils pour améliorer vos matches
- Complétez votre profil
- Ajoutez des photos récentes
- Soyez authentique dans votre bio

*Plus votre profil est complet, meilleurs seront vos matches !*',
'Comprendre l''algorithme de matching d''Amora - Comment nous trouvons vos matches parfaits', 'support', 1),

('contact', 'Contact',
'# Nous contacter

## Support utilisateur
**Email** : support@amora.com  
**Temps de réponse** : 24-48h

## Urgences et sécurité
**Email** : security@amora.com  
**Temps de réponse** : 2-4h

## Partenariats
**Email** : partnerships@amora.com

## Presse et médias
**Email** : press@amora.com

## Adresse postale
Amora  
123 Rue de l''Amour  
75001 Paris, France

*Nous sommes là pour vous aider !*',
'Contactez l''équipe Amora - Support, sécurité et informations de contact', 'support', 2),

('faq', 'Questions fréquentes',
'# Questions fréquentes (FAQ)

## Compte et inscription

### Comment créer un compte ?
1. Cliquez sur "S''inscrire"
2. Remplissez vos informations
3. Vérifiez votre email
4. Complétez votre profil

### J''ai oublié mon mot de passe
Utilisez le lien "Mot de passe oublié" sur la page de connexion.

## Profil et photos

### Comment ajouter des photos ?
Allez dans "Mon profil" > "Photos" et cliquez sur "Ajouter une photo".

### Puis-je modifier mes informations ?
Oui, dans "Paramètres" > "Modifier le profil".

## Matching et messages

### Comment fonctionne le matching ?
Consultez notre guide "[Comment fonctionne le matching](/how-matching-works)".

### Pourquoi je ne reçois pas de matches ?
- Vérifiez vos critères de recherche
- Complétez votre profil
- Ajoutez plus de photos

## Sécurité

### Comment signaler un utilisateur ?
Cliquez sur les trois points sur le profil > "Signaler".

### Mes données sont-elles sécurisées ?
Oui, consultez notre [Politique de confidentialité](/privacy-policy).

*Besoin d''aide ? [Contactez-nous](/contact) !*',
'FAQ Amora - Réponses aux questions les plus fréquentes sur notre plateforme', 'support', 3),

('help-center', 'Centre d''aide',
'# Centre d''aide Amora

## Guides rapides

### 🚀 Premiers pas
- [Créer votre profil parfait](#profile-tips)
- [Comprendre les matches](#matching-guide)
- [Envoyer votre premier message](#messaging-tips)

### 💬 Communication
- [Conseils de conversation](#conversation-tips)
- [Sécurité dans les rencontres](#safety-tips)
- [Signaler un problème](#reporting)

### ⚙️ Paramètres
- [Gérer vos préférences](#preferences)
- [Contrôler votre visibilité](#visibility)
- [Supprimer votre compte](#account-deletion)

## Conseils d''experts

### Créer un profil attractif
1. **Photo principale** : Souriez et regardez l''objectif
2. **Bio** : Soyez authentique et spécifique
3. **Intérêts** : Ajoutez vos vrais hobbies

### Sécurité
- Ne partagez jamais d''informations personnelles
- Rencontrez-vous dans des lieux publics
- Faites confiance à votre instinct

## Besoin d''aide personnalisée ?
[Contactez notre support](/contact) - Nous sommes là pour vous !',
'Centre d''aide Amora - Guides, conseils et support pour optimiser votre expérience', 'support', 4);

-- Indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_legal_pages_slug ON legal_pages(slug);
CREATE INDEX IF NOT EXISTS idx_legal_pages_category ON legal_pages(category);
CREATE INDEX IF NOT EXISTS idx_legal_pages_active ON legal_pages(is_active);
CREATE INDEX IF NOT EXISTS idx_legal_pages_order ON legal_pages(category, order_index);

-- Trigger pour updated_at
CREATE TRIGGER update_legal_pages_updated_at 
  BEFORE UPDATE ON legal_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour tous
CREATE POLICY "Allow public read legal pages" ON legal_pages
  FOR SELECT USING (is_active = true);

-- Modification uniquement pour les admins
CREATE POLICY "Allow admin full access legal pages" ON legal_pages
  FOR ALL USING (auth.jwt() ->> 'email' = 'clodenerc@yahoo.fr');
