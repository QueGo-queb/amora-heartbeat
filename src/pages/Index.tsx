import { useState } from "react";
import { Heart, Users, MessageCircle, ArrowRight, Sparkles, Shield, Award, Megaphone, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LanguageSelector } from "@/components/ui/language-selector";
import { AnimatedSlogan } from "@/components/ui/animated-slogan";
import { CultureCarousel } from "@/components/ui/culture-carousel";
import { SignupForm } from "@/components/ui/signup-form";
import { analytics } from '@/lib/analytics';
import Footer from "@/components/layout/Footer";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAdSpaceVisibility } from '@/hooks/useAdSpaceVisibility';
import { AdSpace } from '@/components/advertising/AdSpace';
import { footerTranslations } from '@/lib/footerTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const { isVisible: adSpaceVisible, toggleAdSpaceVisibility, loading: adSpaceLoading } = useAdSpaceVisibility();
  const { toast } = useToast();

  const translations = {
    fr: {
      hero: "Trouvez l'amour sans frontières",
      subtitle: "La plateforme de rencontre multiculturelle dédiée aux célibataires haïtiens, latinos, caribéens et africains dans le monde entier",
      cta: "Créer votre compte pour trouver votre moitié",
      login: "Se connecter",
      features: {
        matching: "Matching intelligent",
        matchingDesc: "Algorithme basé sur vos préférences culturelles et géographiques",
        community: "Communauté diverse",
        communityDesc: "Rencontrez des célibataires de Haïti, Amérique latine, Caraïbes et Afrique",
        messaging: "Messagerie sécurisée",
        messagingDesc: "Communiquez en toute sécurité dans votre langue préférée"
      },
      stats: {
        members: "Membres actifs",
        countries: "Pays représentés",
        matches: "Connexions réussies"
      },
      premium: {
        title: "Débloquez votre potentiel amoureux",
        subtitle: "Rejoignez des milliers de célibataires qui ont trouvé l'amour grâce à nos fonctionnalités premium",
        security: "Sécurité maximale",
        securityDesc: "Profils vérifiés et modération 24h/7j",
        matching: "Algorithme avancé",
        matchingDesc: "Compatibilité basée sur vos valeurs culturelles"
      }
    },
    en: {
      hero: "Find love without borders",
      subtitle: "The multicultural dating platform dedicated to Haitian, Latino, Caribbean and African singles worldwide",
      cta: "Create your account to find your soulmate",
      login: "Sign in",
      features: {
        matching: "Smart matching",
        matchingDesc: "Algorithm based on your cultural and geographical preferences",
        community: "Diverse community",
        communityDesc: "Meet singles from Haiti, Latin America, Caribbean and Africa",
        messaging: "Secure messaging",
        messagingDesc: "Communicate safely in your preferred language"
      },
      stats: {
        members: "Active members",
        countries: "Countries represented",
        matches: "Successful connections"
      },
      premium: {
        title: "Unlock your love potential",
        subtitle: "Join thousands of singles who found love through our premium features",
        security: "Maximum security",
        securityDesc: "Verified profiles and 24/7 moderation",
        matching: "Advanced algorithm",
        matchingDesc: "Compatibility based on your cultural values"
      }
    },
    ht: {
      hero: "Jwenn lanmou san fwontyè",
      subtitle: "Platfòm randevou miltikiltirèl la ki dedye pou selebatè ayisyen, latino, karayiben ak afriken nan mond lan",
      cta: "Kreye kont ou pou jwenn nanm ou",
      login: "Konekte",
      features: {
        matching: "Matching entelijan",
        matchingDesc: "Algoritm ki baze sou preferans kiltirèl ak jewografik ou yo",
        community: "Kominote divès",
        communityDesc: "Rankontre selebatè ki soti nan Ayiti, Amerik Latin, Karayib ak Afrik",
        messaging: "Mesaj sekirite",
        messagingDesc: "Kominike nan sekirite nan lang ou prefere a"
      },
      stats: {
        members: "Manm aktif",
        countries: "Peyi ki reprezante",
        matches: "Konneksyon ki reyisi"
      },
      premium: {
        title: "Ouvri potansyèl lanmou ou",
        subtitle: "Rantre nan dè milye selebatè ki jwenn lanmou ak fonksyonalite premium nou yo",
        security: "Sekirite maksimòm",
        securityDesc: "Pwofil verifye ak moderasyon 24è/7j",
        matching: "Algoritm avanse",
        matchingDesc: "Konpatibilite ki baze sou valè kiltirèl ou yo"
      }
    },
    es: {
      hero: "Encuentra el amor sin fronteras",
      subtitle: "La plataforma de citas multicultural dedicada a solteros haitianos, latinos, caribeños y africanos en todo el mundo",
      cta: "Crea tu cuenta para encontrar tu alma gemela",
      login: "Iniciar sesión",
      features: {
        matching: "Matching inteligente",
        matchingDesc: "Algoritmo basado en tus preferencias culturales y geográficas",
        community: "Comunidad diversa",
        communityDesc: "Conoce solteros de Haití, América Latina, Caribe y África",
        messaging: "Mensajería segura",
        messagingDesc: "Comunícate de forma segura en tu idioma preferido"
      },
      stats: {
        members: "Miembros activos",
        countries: "Países representados",
        matches: "Conexiones exitosas"
      },
      premium: {
        title: "Desbloquea tu potencial amoroso",
        subtitle: "Únete a miles de solteros que encontraron el amor con nuestras funciones premium",
        security: "Máxima seguridad",
        securityDesc: "Perfiles verificados y moderación 24h/7d",
        matching: "Algoritmo avanzado",
        matchingDesc: "Compatibilidad basada en tus valores culturales"
      }
    },
    ptBR: {
      hero: "Encontre o amor sem fronteiras",
      subtitle: "A plataforma de encontros multicultural dedicada a solteiros haitianos, latinos, caribenhos e africanos em todo o mundo",
      cta: "Crie sua conta para encontrar sua alma gêmea",
      login: "Entrar",
      features: {
        matching: "Matching inteligente",
        matchingDesc: "Algoritmo baseado em suas preferências culturais e geográficas",
        community: "Comunidade diversa",
        communityDesc: "Conheça solteiros do Haiti, América Latina, Caribe e África",
        messaging: "Mensagens seguras",
        messagingDesc: "Comunique-se com segurança em seu idioma preferido"
      },
      stats: {
        members: "Membros ativos",
        countries: "Países representados",
        matches: "Conexões bem-sucedidas"
      },
      premium: {
        title: "Desbloqueie seu potencial amoroso",
        subtitle: "Junte-se a milhares de solteiros que encontraram o amor através de nossos recursos premium",
        security: "Segurança máxima",
        securityDesc: "Perfis verificados e moderação 24h/7d",
        matching: "Algoritmo avançado",
        matchingDesc: "Compatibilidade baseada em seus valores culturais"
      }
    }
  };

  const t = translations[selectedLanguage as keyof typeof translations] || translations.fr;

  const handleAdSpaceToggle = async (checked: boolean) => {
    const success = await toggleAdSpaceVisibility(checked);
    if (success) {
      toast({
        title: "Espace publicitaire",
        description: `Espace publicitaire ${checked ? 'activé' : 'désactivé'}`,
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'espace publicitaire",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header - DESIGN MAINTENU avec nouvelle palette */}
      <header className="sticky top-0 z-50 w-full border-b border-[#CED4DA] bg-[#F8F9FA]/95 backdrop-blur supports-[backdrop-filter]:bg-[#F8F9FA]/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="heart-logo">
              <div className="heart-shape bg-gradient-to-br from-[#E63946] to-[#52B788]" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#E63946] to-[#52B788] bg-clip-text text-transparent">AMORA</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-[#CED4DA] text-[#212529] hover:bg-[#E63946] hover:text-white hover:border-[#E63946]" asChild>
              <Link to="/auth">{t.login}</Link>
            </Button>
            <LanguageSelector 
              selectedLanguage={selectedLanguage} 
              onLanguageChange={setSelectedLanguage} 
            />
          </div>
        </div>
      </header>

      {/* Hero Section - DESIGN MAINTENU avec nouvelle palette */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#E63946] to-[#52B788] bg-clip-text text-transparent">
              {t.hero}
            </h1>
            <p className="text-xl md:text-2xl text-[#CED4DA] mb-8 max-w-3xl mx-auto">
              {t.subtitle}
            </p>
            
            <AnimatedSlogan language={selectedLanguage} />
            
            <div className="mt-8">
              <Dialog open={false} onOpenChange={() => {}}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-[#E63946] to-[#E63946]/90 hover:from-[#E63946]/90 hover:to-[#E63946] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    {t.cta}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <SignupForm language={selectedLanguage} onClose={() => {}} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Culture Carousel - DESIGN MAINTENU */}
          <div className="mb-16">
            <CultureCarousel />
          </div>

          {/* NOUVEL ESPACE PUBLICITAIRE */}
          <div className="mb-16">
            <AdSpace />
          </div>
        </div>
      </section>

      {/* Premium Features Section - DESIGN MAINTENU avec nouvelle palette */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#CED4DA]/10 via-[#E63946]/10 to-[#52B788]/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-[#E63946]" />
              <h2 className="text-3xl font-bold text-[#212529]">{t.premium.title}</h2>
            </div>
            <p className="text-lg text-[#CED4DA] max-w-2xl mx-auto">{t.premium.subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-[#F8F9FA] border-[#E63946]/20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-[#E63946]" />
                  <h3 className="text-xl font-semibold text-[#212529]">{t.premium.security}</h3>
                </div>
                <p className="text-[#CED4DA]">{t.premium.securityDesc}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#F8F9FA] border-[#52B788]/20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-[#52B788]" />
                  <h3 className="text-xl font-semibold text-[#212529]">{t.premium.matching}</h3>
                </div>
                <p className="text-[#CED4DA]">{t.premium.matchingDesc}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features - DESIGN MAINTENU avec nouvelle palette */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-[#F8F9FA] border-[#CED4DA] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1 text-center">
              <CardContent className="pt-6">
                <Heart className="w-12 h-12 mx-auto mb-4 text-[#E63946]" />
                <h3 className="text-xl font-semibold mb-2 text-[#212529]">{t.features.matching}</h3>
                <p className="text-[#CED4DA]">{t.features.matchingDesc}</p>
              </CardContent>
            </Card>

            <Card className="bg-[#F8F9FA] border-[#CED4DA] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1 text-center">
              <CardContent className="pt-6">
                <Users className="w-12 h-12 mx-auto mb-4 text-[#52B788]" />
                <h3 className="text-xl font-semibold mb-2 text-[#212529]">{t.features.community}</h3>
                <p className="text-[#CED4DA]">{t.features.communityDesc}</p>
              </CardContent>
            </Card>

            <Card className="bg-[#F8F9FA] border-[#CED4DA] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1 text-center">
              <CardContent className="pt-6">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-[#52B788]" />
                <h3 className="text-xl font-semibold mb-2 text-[#212529]">{t.features.messaging}</h3>
                <p className="text-[#CED4DA]">{t.features.messagingDesc}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats - DESIGN MAINTENU avec nouvelle palette */}
      <section className="py-16 px-4 bg-[#E63946] text-white">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-lg">{t.stats.members}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">25+</div>
              <div className="text-lg">{t.stats.countries}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-lg">{t.stats.matches}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer dynamique */}
      <Footer language={selectedLanguage} />
    </div>
  );
};

export default Index;
