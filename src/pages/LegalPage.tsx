import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface LegalPageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description?: string;
  category: string;
  updated_at: string;
}

const LegalPage = () => {
  const { slug, lang } = useParams<{ slug: string; lang?: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<LegalPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadPage(slug, lang);
    }
  }, [slug, lang]);

  const loadPage = async (pageSlug: string, language?: string) => {
    try {
      setLoading(true);
      setError(null);

      // 🔧 SOLUTION TEMPORAIRE : Pages statiques en attendant la migration
      const staticPages: { [key: string]: LegalPageData } = {
        'terms-of-service': {
          id: '1',
          slug: 'terms-of-service',
          title: 'Conditions d\'utilisation',
          content: `# Conditions d'utilisation d'Amora

## 1. Acceptation des conditions
En utilisant Amora, vous acceptez ces conditions d'utilisation. Si vous n'acceptez pas ces termes, veuillez ne pas utiliser notre service.

## 2. Description du service
Amora est une plateforme de rencontres en ligne qui permet aux utilisateurs de se connecter et de communiquer.

## 3. Responsabilités de l'utilisateur
- Vous devez avoir au moins 18 ans pour utiliser Amora
- Vous êtes responsable de la confidentialité de votre compte
- Vous acceptez de ne pas publier de contenu inapproprié

## 4. Politique de confidentialité
Nous respectons votre vie privée. Consultez notre politique de confidentialité pour plus d'informations.

## 5. Modifications des conditions
Nous nous réservons le droit de modifier ces conditions à tout moment.

*Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}*`,
          meta_description: 'Conditions d\'utilisation de la plateforme Amora - Règles et responsabilités des utilisateurs',
          category: 'legal',
          updated_at: new Date().toISOString()
        },
        'privacy-policy': {
          id: '2',
          slug: 'privacy-policy',
          title: 'Politique de confidentialité',
          content: `# Politique de confidentialité

## 1. Collecte d'informations
Nous collectons les informations que vous nous fournissez lors de l'inscription et de l'utilisation de notre service.

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
Vous avez le droit d'accéder, modifier ou supprimer vos données.

*Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}*`,
          meta_description: 'Politique de confidentialité d\'Amora - Protection de vos données personnelles',
          category: 'legal',
          updated_at: new Date().toISOString()
        },
        'cookies-policy': {
          id: '3',
          slug: 'cookies-policy',
          title: 'Politique des cookies',
          content: `# Politique des cookies

## Qu'est-ce qu'un cookie ?
Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez notre site.

## Types de cookies utilisés
- **Cookies essentiels** : Nécessaires au fonctionnement du site
- **Cookies analytiques** : Pour améliorer nos services
- **Cookies de préférences** : Pour mémoriser vos choix

## Gestion des cookies
Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.

*Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}*`,
          meta_description: 'Politique des cookies - Comment nous utilisons les cookies sur Amora',
          category: 'legal',
          updated_at: new Date().toISOString()
        },
        'legal-notices': {
          id: '4',
          slug: 'legal-notices',
          title: 'Mentions légales',
          content: `# Mentions légales

## Éditeur du site
**Amora**  
Plateforme de rencontres en ligne

## Hébergement
Supabase Inc.  
970 Toa Payoh North #07-04  
Singapore 318992

## Propriété intellectuelle
Tous les contenus présents sur ce site sont protégés par le droit d'auteur.

## Contact
Email : contact@amora.com  
Pour toute question juridique : legal@amora.com

*Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}*`,
          meta_description: 'Mentions légales d\'Amora - Informations juridiques et contacts',
          category: 'legal',
          updated_at: new Date().toISOString()
        },
        'about': {
          id: '5',
          slug: 'about',
          title: 'À propos',
          content: `# À propos d'Amora

## Notre mission
Amora révolutionne les rencontres en ligne en créant des connexions authentiques basées sur la compatibilité réelle.

## Notre vision
Nous croyons que chaque personne mérite de trouver l'amour véritable.

## Nos valeurs
- **Authenticité** : Encourager les vraies connexions
- **Sécurité** : Protéger nos utilisateurs
- **Inclusion** : Accueillir tout le monde
- **Innovation** : Améliorer constamment l'expérience

## L'équipe
Une équipe passionnée dédiée à créer la meilleure expérience de rencontres.

*Rejoignez-nous dans cette aventure !*`,
          meta_description: 'Découvrez Amora - Notre mission, vision et valeurs pour révolutionner les rencontres',
          category: 'company',
          updated_at: new Date().toISOString()
        },
        'contact': {
          id: '6',
          slug: 'contact',
          title: 'Contact',
          content: `# Nous contacter

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
123 Rue de l'Amour  
75001 Paris, France

*Nous sommes là pour vous aider !*`,
          meta_description: 'Contactez l\'équipe Amora - Support, sécurité et informations de contact',
          category: 'support',
          updated_at: new Date().toISOString()
        },
        'faq': {
          id: '7',
          slug: 'faq',
          title: 'Questions fréquentes',
          content: `# Questions fréquentes (FAQ)

## Compte et inscription

### Comment créer un compte ?
1. Cliquez sur "S'inscrire"
2. Remplissez vos informations
3. Vérifiez votre email
4. Complétez votre profil

### J'ai oublié mon mot de passe
Utilisez le lien "Mot de passe oublié" sur la page de connexion.

## Profil et photos

### Comment ajouter des photos ?
Allez dans "Mon profil" > "Photos" et cliquez sur "Ajouter une photo".

### Puis-je modifier mes informations ?
Oui, dans "Paramètres" > "Modifier le profil".

## Matching et messages

### Comment fonctionne le matching ?
Notre algorithme analyse vos préférences et centres d'intérêt pour vous proposer des profils compatibles.

### Pourquoi je ne reçois pas de matches ?
- Vérifiez vos critères de recherche
- Complétez votre profil
- Ajoutez plus de photos

## Sécurité

### Comment signaler un utilisateur ?
Cliquez sur les trois points sur le profil > "Signaler".

### Mes données sont-elles sécurisées ?
Oui, consultez notre Politique de confidentialité pour plus d'informations.

*Besoin d'aide ? Contactez-nous !*`,
          meta_description: 'FAQ Amora - Réponses aux questions les plus fréquentes sur notre plateforme',
          category: 'support',
          updated_at: new Date().toISOString()
        },
        'help-center': {
          id: '8',
          slug: 'help-center',
          title: 'Centre d\'aide',
          content: `# Centre d'aide Amora

## Guides rapides

### 🚀 Premiers pas
- **Créer votre profil parfait** : Ajoutez des photos récentes et une bio authentique
- **Comprendre les matches** : Notre algorithme analyse vos intérêts et préférences
- **Envoyer votre premier message** : Soyez authentique et posez des questions ouvertes

### 💬 Communication
- **Conseils de conversation** : Montrez votre personnalité et soyez respectueux
- **Sécurité dans les rencontres** : Rencontrez-vous dans des lieux publics
- **Signaler un problème** : Utilisez le bouton de signalement sur les profils

### ⚙️ Paramètres
- **Gérer vos préférences** : Ajustez vos critères de recherche dans les paramètres
- **Contrôler votre visibilité** : Choisissez qui peut voir votre profil
- **Supprimer votre compte** : Option disponible dans les paramètres de sécurité

## Conseils d'experts

### Créer un profil attractif
1. **Photo principale** : Souriez et regardez l'objectif
2. **Bio** : Soyez authentique et spécifique sur vos passions
3. **Intérêts** : Ajoutez vos vrais hobbies et centres d'intérêt

### Optimiser vos matches
- Complétez votre profil à 100%
- Soyez actif sur la plateforme
- Répondez rapidement aux messages

### Sécurité et bien-être
- Ne partagez jamais d'informations personnelles trop tôt
- Faites confiance à votre instinct
- Signalez tout comportement inapproprié

## Questions fréquentes

### Comment fonctionne l'algorithme ?
Notre système analyse vos préférences, intérêts communs, localisation et comportement pour vous proposer des profils compatibles.

### Pourquoi je ne reçois pas de matches ?
- Vérifiez vos critères de recherche (peut-être trop restrictifs)
- Améliorez votre profil avec plus de photos
- Soyez plus actif dans vos interactions

### Comment améliorer ma visibilité ?
- Connectez-vous régulièrement
- Likez et commentez d'autres profils
- Mettez à jour votre profil fréquemment

## Besoin d'aide personnalisée ?
Notre équipe support est disponible 24h/7j pour vous aider.

**Email** : support@amora.com  
**Temps de réponse** : 2-4h

*Nous sommes là pour faire de votre expérience Amora un succès !*`,
          meta_description: 'Centre d\'aide Amora - Guides, conseils et support pour optimiser votre expérience de rencontre',
          category: 'support',
          updated_at: new Date().toISOString()
        },
        'support': {
          id: '9',
          slug: 'support',
          title: 'Support',
          content: `# Support Amora

## Comment nous contacter

### 📧 Email
Pour toute question ou assistance, contactez-nous à : **support@amora.ca**

### 💬 Chat en ligne
Utilisez notre système de chat intégré pour une assistance immédiate.

### 📞 Assistance téléphonique
Disponible du lundi au vendredi de 9h à 17h (EST)

### 🆘 Urgences
Pour les problèmes urgents liés à la sécurité, contactez-nous immédiatement.

## Temps de réponse
- Email : 24-48 heures
- Chat : Immédiat pendant les heures d'ouverture
- Téléphone : Immédiat pendant les heures d'ouverture

## FAQ
Consultez notre [section FAQ](/faq) pour les questions fréquentes.`,
          meta_description: 'Contactez le support Amora pour toute assistance technique ou question.',
          category: 'support',
          updated_at: new Date().toISOString()
        }
      };

      // Chercher d'abord dans les pages statiques
      const staticPage = staticPages[pageSlug];
      if (staticPage) {
        setPage(staticPage);
        
        // Mettre à jour le titre de la page
        document.title = `${staticPage.title} - Amora`;
        
        // Mettre à jour les meta tags
        if (staticPage.meta_description) {
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute('content', staticPage.meta_description);
          }
        }
      } else {
        // Si pas trouvé dans les pages statiques, essayer la base de données
        const { data, error: supabaseError } = await supabase
          .from('legal_pages')
          .select('*')
          .eq('slug', pageSlug)
          .eq('is_active', true)
          .single();

        if (supabaseError) {
          throw new Error('Page non trouvée');
        }

        setPage(data);
        
        // Mettre à jour le titre de la page
        document.title = `${data.title} - Amora`;
        
        // Mettre à jour les meta tags
        if (data.meta_description) {
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute('content', data.meta_description);
          }
        }
      }
    } catch (err: any) {
      console.error('Error loading legal page:', err);
      setError(err.message || 'Erreur lors du chargement de la page');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'legal':
        return { 
          label: 'Légal', 
          color: 'bg-[#E63946] text-white',
          icon: <FileText className="w-3 h-3" />
        };
      case 'support':
        return { 
          label: 'Support', 
          color: 'bg-[#52B788] text-white',
          icon: <AlertCircle className="w-3 h-3" />
        };
      case 'company':
        return { 
          label: 'Entreprise', 
          color: 'bg-[#CED4DA] text-[#212529]',
          icon: <FileText className="w-3 h-3" />
        };
      default:
        return { 
          label: 'Information', 
          color: 'bg-gray-500 text-white',
          icon: <FileText className="w-3 h-3" />
        };
    }
  };

  // Helper function pour formatter le contenu
  const formatContent = (content: string) => {
    return content
      .replace(/# (.*)/g, '<h1 style="font-size: 2rem; font-weight: bold; margin: 1.5rem 0; color: #212529;">$1</h1>')
      .replace(/## (.*)/g, '<h2 style="font-size: 1.5rem; font-weight: bold; margin: 1.25rem 0; color: #212529;">$1</h2>')
      .replace(/### (.*)/g, '<h3 style="font-size: 1.25rem; font-weight: bold; margin: 1rem 0; color: #212529;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #212529;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*)/gm, '<li style="margin: 0.5rem 0;">$1</li>')
      .replace(/(\n|^)([^<\n].*?)(\n|$)/g, '<p style="margin: 1rem 0; color: #212529; line-height: 1.6;">$2</p>')
      .replace(/\n/g, '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4 w-1/3"></div>
            <div className="h-12 bg-gray-300 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-4 bg-gray-300 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-[#E63946]/20">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-16 h-16 text-[#E63946] mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-[#212529] mb-2">
                Page non trouvée
              </h1>
              <p className="text-[#CED4DA] mb-6">
                {error || 'La page que vous recherchez n\'existe pas.'}
              </p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-[#E63946] hover:bg-[#E63946]/90 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(page.category);

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4 text-[#212529] hover:bg-[#CED4DA]/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <Badge className={categoryInfo.color}>
              {categoryInfo.icon}
              <span className="ml-1">{categoryInfo.label}</span>
            </Badge>
            <div className="flex items-center text-sm text-[#CED4DA]">
              <Calendar className="w-4 h-4 mr-1" />
              Mis à jour le {new Date(page.updated_at).toLocaleDateString('fr-FR')}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-[#212529] mb-2">
            {page.title}
          </h1>
          
          {page.meta_description && (
            <p className="text-[#CED4DA] text-lg">
              {page.meta_description}
            </p>
          )}
        </div>

        {/* Content */}
        <Card className="border-[#CED4DA]/30 shadow-sm">
          <CardContent className="py-8">
            <div className="prose prose-lg max-w-none">
              <div 
                dangerouslySetInnerHTML={{
                  __html: formatContent(page.content)
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer action */}
        <div className="mt-8 text-center">
          <p className="text-[#CED4DA] mb-4">
            Vous avez des questions ? Nous sommes là pour vous aider.
          </p>
          <Button 
            onClick={() => navigate('/contact')}
            variant="outline"
            className="border-[#52B788] text-[#52B788] hover:bg-[#52B788] hover:text-white"
          >
            Nous contacter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;