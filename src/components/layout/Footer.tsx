import { useState, useEffect } from 'react';
import { Mail, Facebook, Instagram, Twitter, Linkedin, Youtube, MapPin, Phone, Clock, Shield, Heart, Users, Globe, ArrowRight } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());

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

  // Données de contenu
  const footerData = {
    company: {
      name: "AMORA",
      description: "La plateforme de rencontres qui transcende les frontières. Connectez-vous avec des personnes authentiques du monde entier et découvrez l'amour sans limites.",
      stats: [
        { icon: Users, value: "10M+", label: "Utilisateurs actifs" },
        { icon: Globe, value: "150+", label: "Pays" },
        { icon: Heart, value: "500K+", label: "Couples formés" }
      ]
    },
    quickLinks: [
      { name: "Accueil", href: "/" },
      { name: "Comment ça marche", href: "/how-it-works" },
      { name: "Témoignages", href: "/testimonials" },
      { name: "Blog", href: "/blog" },
      { name: "Carrières", href: "/careers" }
    ],
    support: [
      { name: "Centre d'aide", href: "/help" },
      { name: "Contact", href: "/contact" },
      { name: "Signaler un problème", href: "/report" },
      { name: "FAQ", href: "/faq" },
      { name: "Guide de sécurité", href: "/safety" }
    ],
    legal: [
      { name: "Conditions d'utilisation", href: "/terms" },
      { name: "Politique de confidentialité", href: "/privacy" },
      { name: "Cookies", href: "/cookies" },
      { name: "Mentions légales", href: "/legal" }
    ],
    contact: {
      address: "123 Rue de l'Amour, Montréal, QC H3A 1A1",
      phone: "+1 (514) 123-4567",
      email: "hello@amora.ca",
      hours: "Lun-Ven: 9h-18h EST"
    },
    socials: [
      { name: "Facebook", icon: Facebook, href: "https://facebook.com/amora", color: "hover:text-blue-500" },
      { name: "Instagram", icon: Instagram, href: "https://instagram.com/amora", color: "hover:text-pink-500" },
      { name: "Twitter", icon: Twitter, href: "https://twitter.com/amora", color: "hover:text-blue-400" },
      { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/amora", color: "hover:text-blue-600" }
    ]
  };

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
                {/* Texte AMORA avec la même taille et style que partout ailleurs */}
                <span className="text-2xl font-bold gradient-text">
                  {footerData.company.name}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-8 text-sm">
                {footerData.company.description}
              </p>
              {/* Statistiques */}
              <div className="space-y-4">
                {footerData.company.stats.map((stat, index) => {
                  const Icon = stat.icon;
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
                {footerData.quickLinks.map((link, index) => (
                  <li key={index}>
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
                {footerData.support.map((link, index) => (
                  <li key={index}>
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
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{footerData.contact.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <a 
                    href={`tel:${footerData.contact.phone}`} 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {footerData.contact.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <a 
                    href={`mailto:${footerData.contact.email}`} 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {footerData.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-gray-300">{footerData.contact.hours}</span>
                </div>
              </div>
              {/* Réseaux sociaux */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">Suivez-nous</h4>
                <div className="flex space-x-4">
                  {footerData.socials.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a 
                        key={index} 
                        href={social.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center transition-all duration-300 hover:transform hover:scale-110 hover:bg-slate-600 ${social.color}`}
                        aria-label={social.name}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
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
                © {currentYear} Amora. Tous droits réservés.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                L'amour n'a pas de frontières - Connectons les cœurs du monde entier
              </p>
            </div>
            {/* Liens légaux */}
            <div className="flex flex-wrap justify-center gap-6">
              {footerData.legal.map((link, index) => (
                <a 
                  key={index} 
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
