import { useState, useEffect } from 'react';
import { Mail, Facebook, Instagram, Twitter, Linkedin, Youtube, MapPin, Phone, Clock, Shield, Heart, Users, Globe, ArrowRight } from 'lucide-react';
import { useFooter } from '@/hooks/useFooter';
import { footerTranslations, translateDatabaseLink, translateCompanyDescription, generateMultilingualUrl, getFooterLink, detectLinkTypeAndGenerateUrl } from '@/lib/footerTranslations';
import CookieBanner from '@/components/cookies/CookieBanner';

// Ajouter l'icône TikTok personnalisée
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Ajouter une prop pour la langue
interface FooterProps {
  language?: string;
}

const Footer = ({ language = 'fr' }: FooterProps) => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());
  // ✅ MODIFICATION: Récupérer les pages légales depuis le hook
  const { content, links, socials, legalPages, loading, refreshFooter } = useFooter();
  
  const [currentLanguage, setCurrentLanguage] = useState(language);
  
  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  // ✅ AMÉLIORATION: Écoute des événements de synchronisation robuste
  useEffect(() => {
    let refreshTimeout: NodeJS.Timeout;
    
    const handleFooterRefresh = (event: CustomEvent) => {
      console.log('🔄 Événement de rafraîchissement footer reçu:', event.detail);
      
      // ✅ AMÉLIORATION: Debounce pour éviter les rechargements multiples
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      
      refreshTimeout = setTimeout(() => {
        console.log('🔄 Exécution du rafraîchissement footer...');
        refreshFooter();
      }, 100);
    };

    const handleFooterDataUpdated = (event: CustomEvent) => {
      console.log('🔄 Données footer mises à jour:', event.detail);
      
      // ✅ AMÉLIORATION: Forcer le rafraîchissement immédiat pour les mises à jour de pages légales
      if (event.detail?.type === 'legal_page_updated') {
        console.log('🔄 Mise à jour immédiate pour page légale:', event.detail.pageId);
        refreshFooter();
      }
    };

    window.addEventListener('footer-refresh', handleFooterRefresh as EventListener);
    window.addEventListener('footer-data-updated', handleFooterDataUpdated as EventListener);
    
    return () => {
      window.removeEventListener('footer-refresh', handleFooterRefresh as EventListener);
      window.removeEventListener('footer-data-updated', handleFooterDataUpdated as EventListener);
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [refreshFooter]);
  
  const t = footerTranslations[currentLanguage as keyof typeof footerTranslations] || footerTranslations.fr;

  // Gestion de l'inscription à la newsletter
  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setSubscribing(true);
    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 2000));
      setEmail('');
      alert(t.newsletterSuccess);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      alert(t.newsletterError);
    } finally {
      setSubscribing(false);
    }
  };

  // Fonction pour obtenir l'icône d'un réseau social
  const getSocialIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'facebook': return Facebook;
      case 'instagram': return Instagram;
      case 'twitter': return Twitter;
      case 'linkedin': return Linkedin;
      case 'youtube': return Youtube;
      case 'tiktok': return TikTokIcon; // ✅ CORRIGÉ: Vraie icône TikTok
      default: return Globe;
    }
  };

  // Fonction pour obtenir l'icône des statistiques
  const getStatIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'users': return Users;
      case 'globe': return Globe;
      case 'heart': return Heart;
      default: return Users;
    }
  };

  // ✅ AMÉLIORATION: Organiser les liens avec toutes les catégories
  const linksByCategory = {
    quick_links: links.filter(link => link.category === 'quick_links' && link.is_active),
    support: links.filter(link => link.category === 'support' && link.is_active),
    legal: links.filter(link => link.category === 'legal' && link.is_active)
  };

  // ✅ LOGS DE DÉBOGAGE (uniquement en développement)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 DEBUG FOOTER - Tous les liens:', links);
    console.log('🔍 DEBUG FOOTER - Liens support actifs:', linksByCategory.support);
    console.log('🔍 DEBUG FOOTER - Pages légales actives:', legalPages.filter(page => page.is_active));
  }

  // ✅ AMÉLIORATION: Fonction pour générer les liens légaux SANS DOUBLONS
  const getLegalLinks = () => {
    let legalLinks = [];

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DEBUG getLegalLinks - linksByCategory.legal:', linksByCategory.legal);
      console.log('🔍 DEBUG getLegalLinks - legalPages:', legalPages);
    }

    // ✅ PRIORITÉ 1: Utiliser les liens de la base de données s'ils existent
    if (linksByCategory.legal.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📄 Utilisation des liens légaux de la base de données:', linksByCategory.legal.length);
      }
      legalLinks = linksByCategory.legal.map(link => ({
        name: translateDatabaseLink(link.name, currentLanguage),
        href: link.href
      }));
    }
    // ✅ PRIORITÉ 2: Utiliser les pages légales dynamiques
    else if (legalPages.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📄 Utilisation des pages légales dynamiques:', legalPages.length);
      }
      legalLinks = legalPages
        .filter(page => page.is_active)
        .map(page => ({
          name: translateDatabaseLink(page.title, currentLanguage),
          href: `/${page.slug}`
        }));
    }

    // ✅ AJOUT: Ajouter "Paramètres des cookies" seulement s'il n'existe pas déjà
    const cookieSettingsExists = legalLinks.some(link => 
      link.href === '/cookie-settings' || link.name === t.legalLinks.cookieSettings
    );
    
    if (!cookieSettingsExists) {
      legalLinks.push({
        name: t.legalLinks.cookieSettings,
        href: generateMultilingualUrl('/cookie-settings', currentLanguage)
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DEBUG getLegalLinks - résultat final:', legalLinks);
    }
    return legalLinks;
  };

  // ✅ SUPPRESSION DES FALLBACKS STATIQUES - UNIQUEMENT DONNÉES DYNAMIQUES
  const getSupportLinks = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DEBUG getSupportLinks - linksByCategory.support:', linksByCategory.support);
      console.log('🔍 DEBUG getSupportLinks - legalPages support:', legalPages.filter(page => page.category === 'support'));
    }
    
    // ✅ PRIORITÉ 1: Utiliser les liens de la base de données s'ils existent
    if (linksByCategory.support.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📄 Utilisation des liens support de la base de données:', linksByCategory.support.length);
      }
      return linksByCategory.support.map(link => ({
        name: translateDatabaseLink(link.name, currentLanguage),
        href: link.href
      }));
    }
    
    // ✅ PRIORITÉ 2: Utiliser les pages légales avec catégorie 'support'
    const supportPages = legalPages.filter(page => page.category === 'support' && page.is_active);
    if (supportPages.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📄 Utilisation des pages légales support:', supportPages.length);
      }
      return supportPages.map(page => ({
        name: translateDatabaseLink(page.title, currentLanguage),
        href: `/${page.slug}`
      }));
    }

    // ❌ SUPPRIMÉ: Plus de fallback statique
    if (process.env.NODE_ENV === 'development') {
      console.log('📄 Aucun lien support configuré en base de données');
    }
    return [];
  };

  // ✅ SUPPRESSION DES FALLBACKS STATIQUES - UNIQUEMENT DONNÉES DYNAMIQUES
  const getCompanyLinks = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DEBUG getCompanyLinks - legalPages company:', legalPages.filter(page => page.category === 'company'));
    }
    
    // ✅ PRIORITÉ: Utiliser les pages légales avec catégorie 'company'
    const companyPages = legalPages.filter(page => page.category === 'company' && page.is_active);
    if (companyPages.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📄 Utilisation des pages légales company:', companyPages.length);
      }
      return companyPages.map(page => ({
        name: translateDatabaseLink(page.title, currentLanguage),
        href: `/${page.slug}`
      }));
    }

    // ❌ SUPPRIMÉ: Plus de fallback statique
    if (process.env.NODE_ENV === 'development') {
      console.log('📄 Aucun lien company configuré en base de données');
    }
    return [];
  };

  // ✅ CORRECTION: Filtrer seulement les réseaux sociaux ACTIFS
  const activeSocials = socials.filter(social => social.is_active);

  // ❌ SUPPRIMÉ: getLocalizedHref n'est plus nécessaire sans fallbacks statiques

  if (loading) {
    return (
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>{t.loadingFooter}</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Éléments décoratifs d'arrière-plan */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-red-500 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-pink-500 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-500 blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Section principale */}
        <div className="container mx-auto px-6 py-16">
          {/* ✅ AMÉLIORATION: Grille avec 6 colonnes pour inclure la section Company */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
            {/* 🔒 SECTION PROTÉGÉE - À propos d'Amora - NE JAMAIS MODIFIER */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                {/* Logo cohérent avec le reste de l'application */}
                <div className="heart-logo">
                  <div className="heart-shape" />
                </div>
                <span className="text-2xl font-bold gradient-text">
                  {content?.company_name || 'AMORA'}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-8 text-sm">
                {translateCompanyDescription(content?.company_description, currentLanguage)}
              </p>
              {/* Statistiques */}
              {content?.company_stats && (
                <div className="grid grid-cols-1 gap-4 mb-8">
                  {content.company_stats.map((stat, index) => {
                    const Icon = getStatIcon(stat.icon);
                    return (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                          <Icon className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{stat.value}</div>
                          <div className="text-gray-400 text-xs">{stat.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ✅ CORRECTION: Réseaux sociaux ACTIFS seulement */}
              {activeSocials.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-white">{t.followUs}</h4>
                  <div className="flex space-x-4">
                    {activeSocials.map((social) => {
                      const Icon = getSocialIcon(social.icon_name);
                      return (
                        <a 
                          key={social.id}
                          href={social.href}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-all duration-300 hover:transform hover:scale-110 ${social.color_class}`}
                          aria-label={social.name}
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {activeSocials.length} {activeSocials.length > 1 ? t.activeNetworksPlural : t.activeNetworks}
                  </p>
                </div>
              )}

              {/* ✅ DEBUG: Afficher si aucun réseau actif */}
              {activeSocials.length === 0 && socials.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-white">{t.followUs}</h4>
                  <p className="text-sm text-gray-400">
                    {t.noActiveNetworks} ({socials.length} {socials.length > 1 ? t.disabledPlural : t.disabled})
                  </p>
                </div>
              )}
            </div>
            {/* 🔒 FIN SECTION PROTÉGÉE */}

            {/* Newsletter */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-white">{t.newsletter}</h3>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                {t.newsletterDesc}
              </p>
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder={t.emailPlaceholder}
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                    required 
                  />
                  <Mail className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
                </div>
                <button 
                  onClick={handleNewsletterSubscribe}
                  disabled={subscribing}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {subscribing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t.subscribing}
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      {t.subscribe}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ✅ Section Company - UNIQUEMENT DONNÉES DYNAMIQUES */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-white">{t.supportLinks.about}</h3>
              <ul className="space-y-3">
                {getCompanyLinks().length > 0 ? (
                  getCompanyLinks().map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href} 
                        className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {link.name}
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400 text-sm">Aucun lien configuré</li>
                )}
              </ul>
            </div>

            {/* ✅ Support - UNIQUEMENT DONNÉES DYNAMIQUES */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-white">{t.support}</h3>
              <ul className="space-y-3">
                {getSupportLinks().length > 0 ? (
                  getSupportLinks().map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href} 
                        className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {link.name}
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400 text-sm">Aucun lien configuré</li>
                )}
              </ul>
            </div>

            {/* ✅ Legal - UNIQUEMENT DONNÉES DYNAMIQUES */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-white">{t.legal}</h3>
              <ul className="space-y-3">
                {/* ✅ AMÉLIORATION: Utiliser les liens de la base de données */}
                {getLegalLinks().length > 0 ? (
                  getLegalLinks().map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href} 
                        className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {link.name}
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400 text-sm">Aucun lien légal configuré</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-slate-700">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>© {currentYear} Amora. {t.copyright}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>{t.madeWithLove}</span>
                <Heart className="w-4 h-4 text-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bandeau cookies */}
      <CookieBanner />
    </footer>
  );
};

export default Footer;
