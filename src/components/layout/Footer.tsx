import { useState, useEffect } from 'react';
import { Mail, Facebook, Instagram, Twitter, Linkedin, Youtube, MapPin, Phone, Clock, Shield, Heart, Users, Globe, ArrowRight } from 'lucide-react';
import { useFooter } from '@/hooks/useFooter';
import { footerTranslations, translateDatabaseLink, translateCompanyDescription } from '@/lib/footerTranslations';

// Ajouter une prop pour la langue
interface FooterProps {
  language?: string;
}

const Footer = ({ language = 'fr' }: FooterProps) => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());
  const { content, links, socials, loading } = useFooter();
  
  // ✅ AJOUT: Traductions
  const t = footerTranslations[language as keyof typeof footerTranslations] || footerTranslations.fr;

  // Gestion de l'inscription à la newsletter
  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setSubscribing(true);
    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 2000));
      setEmail('');
      alert(t.newsletterSuccess); // ✅ TRADUIT
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      alert(t.newsletterError); // ✅ TRADUIT
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
      case 'tiktok': return Globe; // TikTok utilise Globe pour l'instant
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

  // ✅ CORRECTION: Organiser les liens et socials ACTIFS uniquement
  const linksByCategory = {
    quick_links: links.filter(link => link.category === 'quick_links' && link.is_active),
    support: links.filter(link => link.category === 'support' && link.is_active),
    legal: links.filter(link => link.category === 'legal' && link.is_active)
  };

  // ✅ CORRECTION: Filtrer seulement les réseaux sociaux ACTIFS
  const activeSocials = socials.filter(social => social.is_active);

  console.log('🔍 === FOOTER DEBUG ===');
  console.log('Total socials:', socials.length);
  console.log('Active socials:', activeSocials.length);
  console.log('Socials data:', socials);
  console.log('Active socials data:', activeSocials);

  console.log('🔍 === LINKS DEBUG ===');
  console.log('All links:', links);
  console.log('Links by category:', linksByCategory);
  console.log('Legal links:', linksByCategory.legal);
  console.log('Support links:', linksByCategory.support);

  if (loading) {
    return (
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>{t.loadingFooter}</p> {/* ✅ TRADUIT */}
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
          {/* Modifier la grille principale pour avoir 5 colonnes au lieu de 4 : */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* À propos d'Amora */}
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
                {translateCompanyDescription(content?.company_description, language)}
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
                      console.log('🔗 Displaying social network:', social.name, social.is_active);
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

            {/* Support - Colonne séparée */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-white">{t.support}</h3>
              <ul className="space-y-3">
                {linksByCategory.support.map((link) => (
                  <li key={link.id}>
                    <a 
                      href={link.href} 
                      className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {translateDatabaseLink(link.name, language)}
                    </a>
                  </li>
                ))}
                {linksByCategory.support.length === 0 && (
                  <>
                    <li><a href="/support" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group">
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {t.supportLinks.support}
                    </a></li>
                    <li><a href="/faq" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group">
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {t.supportLinks.faq}
                    </a></li>
                    <li><a href="/help" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group">
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {t.supportLinks.helpCenter}
                    </a></li>
                    <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group">
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {t.supportLinks.contact}
                    </a></li>
                  </>
                )}
              </ul>
            </div>

            {/* Légal - Colonne séparée */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-white">{t.legal}</h3>
              <ul className="space-y-3">
                {linksByCategory.legal.map((link) => (
                  <li key={link.id}>
                    <a 
                      href={link.href} 
                      className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {translateDatabaseLink(link.name, language)}
                    </a>
                  </li>
                ))}
                {linksByCategory.legal.length === 0 && (
                  <>
                    <li><a href="/terms" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group">
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {t.legalLinks.termsOfService}
                    </a></li>
                    <li><a href="/privacy" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group">
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {t.legalLinks.privacyPolicy}
                    </a></li>
                    <li><a href="/cookies" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group">
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {t.legalLinks.cookiePolicy}
                    </a></li>
                    <li><a href="/legal" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group">
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {t.legalLinks.legalNotice}
                    </a></li>
                  </>
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
    </footer>
  );
};

export default Footer;
