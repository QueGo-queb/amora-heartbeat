import { useState, useEffect } from 'react';
import { Mail, Facebook, Instagram, Twitter, Linkedin, Youtube, MapPin, Phone, Clock, Shield, Heart, Users, Globe, ArrowRight } from 'lucide-react';
import { useFooter } from '@/hooks/useFooter';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());
  const { content, links, socials, loading } = useFooter();

  // Gestion de l'inscription à la newsletter
  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setSubscribing(true);
    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 2000));
      setEmail('');
      // Notification de succès (remplacer par votre système de notification)
      alert('Merci ! Vous êtes maintenant abonné à notre newsletter.');
    } catch (error) {
      console.error('Erreur inscription newsletter:', error);
      alert('Une erreur s\'est produite. Veuillez réessayer.');
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

  // Organiser les liens par catégorie
  const linksByCategory = {
    quick_links: links.filter(link => link.category === 'quick_links'),
    support: links.filter(link => link.category === 'support'),
    legal: links.filter(link => link.category === 'legal')
  };

  if (loading) {
    return (
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Chargement du footer...</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
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
                {content?.company_description || 'La plateforme de rencontres qui transcende les frontières.'}
              </p>
              {/* Statistiques */}
              <div className="space-y-4">
                {content?.company_stats?.map((stat, index) => {
                  const Icon = getStatIcon(stat.icon);
                  return (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <span className="font-semibold text-white">{stat.value}</span>
                        <span className="text-gray-400 ml-1">{stat.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Liens rapides */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-white">Liens rapides</h3>
              <ul className="space-y-3">
                {linksByCategory.quick_links.map((link) => (
                  <li key={link.id}>
                    <a 
                      href={link.href} 
                      className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
              
              <h4 className="text-lg font-semibold mt-8 mb-4 text-white">Support</h4>
              <ul className="space-y-3">
                {linksByCategory.support.map((link) => (
                  <li key={link.id}>
                    <a 
                      href={link.href} 
                      className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-white">Contact</h3>
              <div className="space-y-4 mb-8">
                {content?.contact_address && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{content.contact_address}</span>
                  </div>
                )}
                {content?.contact_phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <a 
                      href={`tel:${content.contact_phone}`} 
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {content.contact_phone}
                    </a>
                  </div>
                )}
                {content?.contact_email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <a 
                      href={`mailto:${content.contact_email}`} 
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {content.contact_email}
                    </a>
                  </div>
                )}
                {content?.contact_hours && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-gray-300">{content.contact_hours}</span>
                  </div>
                )}
              </div>
              
              {/* Réseaux sociaux */}
              {socials.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-white">Suivez-nous</h4>
                  <div className="flex space-x-4">
                    {socials.map((social) => {
                      const Icon = getSocialIcon(social.icon_name);
                      return (
                        <a 
                          key={social.id}
                          href={social.href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center transition-all duration-300 hover:transform hover:scale-110 hover:bg-slate-600 ${social.color_class}`}
                          aria-label={social.name}
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-white">Newsletter</h3>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Recevez nos dernières actualités, conseils de rencontre et histoires de succès directement dans votre boîte mail.
              </p>
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="Votre adresse email" 
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
                      Inscription...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      S'abonner
                    </>
                  )}
                </button>
                <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">100% sécurisé</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Vos données sont protégées et nous ne partageons jamais votre email avec des tiers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-slate-700"></div>

        {/* Footer bottom */}
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <p className="text-gray-400 text-sm">
                © {currentYear} {content?.company_name || 'Amora'}. Tous droits réservés.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                L'amour n'a pas de frontières - Connectons les cœurs du monde entier
              </p>
            </div>
            {/* Liens légaux */}
            <div className="flex flex-wrap justify-center gap-6">
              {linksByCategory.legal.map((link) => (
                <a 
                  key={link.id}
                  href={link.href} 
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
                >
                  {link.name}
                </a>
              ))}
            </div>
            {/* Badge de qualité */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Heart className="w-4 h-4 text-red-400 fill-current animate-pulse" />
              <span>Fait avec amour au Canada</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
