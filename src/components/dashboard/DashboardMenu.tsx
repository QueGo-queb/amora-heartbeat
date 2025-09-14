import { useState } from 'react';
import { 
  Menu, 
  X, 
  Heart, 
  MessageCircle, 
  User, 
  Settings,
  Bell,
  Eye,
  Users,
  FileText,
  Shield,
  Cookie,
  Scale,
  HelpCircle,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  LogOut,
  Mail,
  Phone,
  MessageSquare,
  BookOpen,
  Edit3 // ✅ AJOUT pour l'icône des publications
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { AIChatWidget } from '@/components/support/AIChatWidget';

interface DashboardMenuProps {
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  badge?: number;
  badgeText?: string;
  variant?: 'default' | 'secondary' | 'outline';
}

const DashboardMenu = ({ className = '' }: DashboardMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsOpen(false);
  };

  const openLegalModal = (type: string) => {
    setLegalModal(type);
    setIsOpen(false);
  };

  const closeLegalModal = () => setLegalModal(null);

  // Fonctions pour les boutons support
  const handleEmailSupport = () => {
    window.open('mailto:support@amora.ca?subject=Demande de support - AMORA', '_blank');
    setIsOpen(false);
  };

  const handleAIChat = () => {
    setShowAIChat(true);
    setIsOpen(false);
  };

  const handleFAQ = () => {
    openLegalModal('faq');
  };

  const handleDedicatedSupport = () => {
    openLegalModal('dedicated-support');
  };

  // Fonctions pour les interactions sociales
  const handleNewMatches = () => {
    handleNavigation('/matching?filter=new');
  };

  const handleUnreadMessages = () => {
    handleNavigation('/messages?filter=unread');
  };

  const menuItems: MenuItem[] = [
    // Section des interactions sociales
    {
      id: 'matches',
      label: 'Nouveaux matches',
      icon: Heart,
      badge: 12,
      badgeText: '+3 depuis hier',
      action: handleNewMatches
    },
    {
      id: 'unread-messages',
      label: 'Messages non lus',
      icon: MessageCircle,
      badge: 5,
      badgeText: '+2 nouveaux messages',
      action: handleUnreadMessages
    },
    {
      id: 'views',
      label: 'Vues de profil',
      icon: Eye,
      badge: 28,
      badgeText: '+8 cette semaine',
      action: () => handleNavigation('/profile?tab=views')
    },
    
    // Séparateur
    { id: 'separator1', label: '', icon: X },
    
    // Navigation principale
    {
      id: 'matching',
      label: 'Matching',
      icon: Heart,
      action: () => handleNavigation('/matching')
    },
    {
      id: 'messages-nav',
      label: 'Messages',
      icon: MessageCircle,
      action: () => handleNavigation('/messages')
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      action: () => handleNavigation('/profile')
    },
    // ✅ AJOUT - Mes Publications
    {
      id: 'my-posts',
      label: 'Mes Publications',
      icon: Edit3,
      action: () => handleNavigation('/my-posts')
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      action: () => handleNavigation('/settings')
    },
    
    // Séparateur
    { id: 'separator2', label: '', icon: X },
    
    // Support et Aide
    {
      id: 'help',
      label: 'Centre d\'aide',
      icon: HelpCircle,
      action: () => openLegalModal('help')
    },
    {
      id: 'email-support',
      label: '📧 Support par email',
      icon: Mail,
      action: handleEmailSupport
    },
    {
      id: 'ai-chat',
      label: '💬 Chat en ligne',
      icon: MessageSquare,
      action: handleAIChat
    },
    {
      id: 'faq',
      label: '📚 FAQ',
      icon: BookOpen,
      action: handleFAQ
    },
    {
      id: 'dedicated-support',
      label: 'Support dédié',
      icon: Phone,
      action: handleDedicatedSupport
    },
    
    // Séparateur
    { id: 'separator3', label: '', icon: X },
    
    // Règles et conditions
    {
      id: 'terms',
      label: 'Conditions d\'utilisation',
      icon: FileText,
      action: () => openLegalModal('terms')
    },
    {
      id: 'privacy',
      label: 'Politique de confidentialité',
      icon: Shield,
      action: () => openLegalModal('privacy')
    },
    {
      id: 'cookies',
      label: 'Cookies',
      icon: Cookie,
      action: () => openLegalModal('cookies')
    },
    {
      id: 'legal',
      label: 'Mentions légales',
      icon: Scale,
      action: () => openLegalModal('legal')
    }
  ];

  return (
    <>
      {/* Bouton hamburger */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className={`h-9 w-9 ${className}`}
        aria-label="Menu principal"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Menu latéral */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-slate-900/80"
            onClick={toggleMenu}
          />
          
          <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out">
            {/* Header du menu */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50">
              <div className="flex items-center gap-3">
                <div className="heart-logo">
                  <div className="heart-shape" />
                </div>
                <span className="text-xl font-bold text-slate-800">Menu AMORA</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="h-8 w-8 hover:bg-slate-100 rounded-full"
              >
                <X className="h-5 w-5 text-slate-600" />
              </Button>
            </div>

            {/* Contenu du menu */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-white">
              {menuItems.map((item) => {
                if (item.id.startsWith('separator')) {
                  return <div key={item.id} className="border-t border-slate-200 my-4" />;
                }

                return (
                  <Button
                    key={item.id}
                    variant={item.variant || "ghost"}
                    onClick={item.action}
                    className="w-full justify-start h-auto py-4 px-4 text-left hover:bg-slate-50 hover:text-slate-900 transition-colors duration-200 rounded-lg border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900">{item.label}</div>
                        {item.badgeText && (
                          <div className="text-xs text-slate-500 mt-1">
                            {item.badgeText}
                          </div>
                        )}
                      </div>
                      {item.badge && (
                        <Badge variant="default" className="ml-auto bg-blue-600 hover:bg-blue-700">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Footer du menu */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-500 text-center">
                © 2024 AMORA - Trouvez l'amour sans frontières
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat AI Widget */}
      <AIChatWidget 
        open={showAIChat} 
        onClose={() => setShowAIChat(false)} 
      />

      {/* Modals pour les liens légaux et support */}
      <Dialog open={!!legalModal} onOpenChange={closeLegalModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border border-slate-200 shadow-xl">
          <DialogHeader className="border-b border-slate-200 pb-4">
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              {legalModal === 'terms' && <FileText className="w-5 h-5 text-blue-600" />}
              {legalModal === 'privacy' && <Shield className="w-5 h-5 text-green-600" />}
              {legalModal === 'cookies' && <Cookie className="w-5 h-5 text-orange-600" />}
              {legalModal === 'legal' && <Scale className="w-5 h-5 text-purple-600" />}
              {legalModal === 'help' && <HelpCircle className="w-5 h-5 text-red-600" />}
              {legalModal === 'faq' && <BookOpen className="w-5 h-5 text-blue-600" />}
              {legalModal === 'dedicated-support' && <Phone className="w-5 h-5 text-green-600" />}
              
              {legalModal === 'terms' && 'Conditions d\'utilisation'}
              {legalModal === 'privacy' && 'Politique de confidentialité'}
              {legalModal === 'cookies' && 'Politique des cookies'}
              {legalModal === 'legal' && 'Mentions légales'}
              {legalModal === 'help' && 'Centre d\'aide'}
              {legalModal === 'faq' && 'Questions fréquentes (FAQ)'}
              {legalModal === 'dedicated-support' && 'Support dédié'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {legalModal === 'terms' && (
              <div className="prose prose-sm max-w-none">
                <h3>Conditions d'utilisation d'AMORA</h3>
                <p>En utilisant notre plateforme, vous acceptez les conditions suivantes :</p>
                <ul>
                  <li>Respect des autres utilisateurs et de la communauté</li>
                  <li>Utilisation appropriée de la plateforme</li>
                  <li>Respect de la vie privée et des données personnelles</li>
                  <li>Interdiction de comportements abusifs ou frauduleux</li>
                </ul>
                <p>Ces conditions peuvent être mises à jour. Consultez régulièrement cette page.</p>
              </div>
            )}
            
            {legalModal === 'privacy' && (
              <div className="prose prose-sm max-w-none">
                <h3>Politique de confidentialité</h3>
                <p>Votre vie privée est importante pour nous :</p>
                <ul>
                  <li>Protection de vos données personnelles</li>
                  <li>Contrôle de vos informations</li>
                  <li>Transparence sur l'utilisation des données</li>
                  <li>Conformité au RGPD</li>
                </ul>
                <p>Nous ne vendons jamais vos données à des tiers.</p>
              </div>
            )}
            
            {legalModal === 'cookies' && (
              <div className="prose prose-sm max-w-none">
                <h3>Politique des cookies</h3>
                <p>Nous utilisons des cookies pour :</p>
                <ul>
                  <li>Améliorer votre expérience utilisateur</li>
                  <li>Analyser le trafic et les performances</li>
                  <li>Personnaliser le contenu</li>
                  <li>Sécuriser votre connexion</li>
                </ul>
                <p>Vous pouvez contrôler l'utilisation des cookies dans vos paramètres.</p>
              </div>
            )}
            
            {legalModal === 'legal' && (
              <div className="prose prose-sm max-w-none">
                <h3>Mentions légales</h3>
                <p><strong>Éditeur :</strong> AMORA SAS</p>
                <p><strong>Adresse :</strong> 123 Rue de l'Amour, Montréal, QC H3A 1A1</p>
                <p><strong>Téléphone :</strong> +1 (514) 123-4567</p>
                <p><strong>Email :</strong> legal@amora.ca</p>
                <p><strong>SIRET :</strong> 123 456 789 00012</p>
                <p><strong>Directeur de publication :</strong> [Nom du directeur]</p>
                <p><strong>Hébergeur :</strong> [Nom de l'hébergeur]</p>
              </div>
            )}
            
            {legalModal === 'help' && (
              <div className="prose prose-sm max-w-none">
                <h3>Centre d'aide AMORA</h3>
                <p>Besoin d'aide ? Nous sommes là pour vous :</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800">📧 Support par email</h4>
                    <p className="text-blue-600 text-sm">support@amora.ca</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800">💬 Chat en ligne</h4>
                    <p className="text-green-600 text-sm">Disponible 24/7</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800">📚 FAQ</h4>
                    <p className="text-purple-600 text-sm">Questions fréquentes</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-800"> Application mobile</h4>
                    <p className="text-orange-600 text-sm">Support dédié</p>
                  </div>
                </div>
              </div>
            )}
            
            {legalModal === 'faq' && (
              <div className="prose prose-sm max-w-none">
                <h3>Questions fréquentes (FAQ)</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Comment modifier mon profil ?</h4>
                    <p className="text-blue-700 text-sm">Allez dans Menu &gt; Profil, puis cliquez sur &quot;Modifier le profil&quot;.</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800">Comment fonctionne le matching ?</h4>
                    <p className="text-green-700 text-sm">Le matching se base sur vos préférences, centres d&apos;intérêt et localisation.</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800">Qu&apos;apporte l&apos;abonnement Premium ?</h4>
                    <p className="text-purple-700 text-sm">Messages illimités, voir qui vous a liké, boosts de profil et plus encore.</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-800">Comment signaler un profil suspect ?</h4>
                    <p className="text-orange-700 text-sm">Utilisez le bouton &quot;Signaler&quot; sur le profil concerné.</p>
                  </div>
                </div>
              </div>
            )}
            
            {legalModal === 'dedicated-support' && (
              <div className="prose prose-sm max-w-none">
                <h3>Support dédié AMORA</h3>
                <p>Notre équipe support est là pour vous aider :</p>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Demande de contact
                    </h4>
                    <p className="text-green-700 text-sm mt-2">
                      Remplissez le formulaire ci-dessous et un agent vous contactera dans les 24h.
                    </p>
                    <Button 
                      className="mt-3" 
                      onClick={() => window.open('mailto:support@amora.ca?subject=Demande de support dédié&body=Merci de décrire votre problème en détail...', '_blank')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contacter un agent
                    </Button>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800">Heures d'ouverture</h4>
                    <p className="text-blue-700 text-sm">
                      Lun-Ven: 9h-18h EST<br/>
                      Sam-Dim: 10h-16h EST
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardMenu;
