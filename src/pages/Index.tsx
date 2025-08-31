import { useState } from "react";
import { Heart, Users, MessageCircle, ArrowRight, Sparkles, Shield, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LanguageSelector } from "@/components/ui/language-selector";
import { AnimatedSlogan } from "@/components/ui/animated-slogan";
import { CultureCarousel } from "@/components/ui/culture-carousel";
import { SignupForm } from "@/components/ui/signup-form";

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("fr");
  const [showSignupForm, setShowSignupForm] = useState(false);

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
    }
  };

  const t = translations[selectedLanguage as keyof typeof translations] || translations.fr;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="heart-logo">
              <div className="heart-shape" />
            </div>
            <span className="text-2xl font-bold gradient-text">AMORA</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden sm:inline-flex" asChild>
              <Link to="/auth">{t.login}</Link>
            </Button>
            <LanguageSelector 
              selectedLanguage={selectedLanguage} 
              onLanguageChange={setSelectedLanguage} 
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
              {t.hero}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {t.subtitle}
            </p>
            
            <AnimatedSlogan language={selectedLanguage} />
            
            <div className="mt-8">
              <Dialog open={showSignupForm} onOpenChange={setShowSignupForm}>
                <DialogTrigger asChild>
                  <Button className="btn-hero">
                    {t.cta}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <SignupForm language={selectedLanguage} onClose={() => setShowSignupForm(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Culture Carousel */}
          <div className="mb-16">
            <CultureCarousel />
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-accent/10 via-heart-red/10 to-heart-green/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">{t.premium.title}</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.premium.subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="culture-card border-heart-red/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-heart-red" />
                  <h3 className="text-xl font-semibold">{t.premium.security}</h3>
                </div>
                <p className="text-muted-foreground">{t.premium.securityDesc}</p>
              </CardContent>
            </Card>
            
            <Card className="culture-card border-heart-green/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-heart-green" />
                  <h3 className="text-xl font-semibold">{t.premium.matching}</h3>
                </div>
                <p className="text-muted-foreground">{t.premium.matchingDesc}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="culture-card text-center">
              <CardContent className="pt-6">
                <Heart className="w-12 h-12 mx-auto mb-4 text-heart-red" />
                <h3 className="text-xl font-semibold mb-2">{t.features.matching}</h3>
                <p className="text-muted-foreground">{t.features.matchingDesc}</p>
              </CardContent>
            </Card>

            <Card className="culture-card text-center">
              <CardContent className="pt-6">
                <Users className="w-12 h-12 mx-auto mb-4 text-heart-orange" />
                <h3 className="text-xl font-semibold mb-2">{t.features.community}</h3>
                <p className="text-muted-foreground">{t.features.communityDesc}</p>
              </CardContent>
            </Card>

            <Card className="culture-card text-center">
              <CardContent className="pt-6">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-heart-green" />
                <h3 className="text-xl font-semibold mb-2">{t.features.messaging}</h3>
                <p className="text-muted-foreground">{t.features.messagingDesc}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
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

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="heart-logo">
              <div className="heart-shape" />
            </div>
            <span className="text-2xl font-bold gradient-text">AMORA</span>
          </div>
          <p className="text-muted-foreground">
            L'amour sans frontières • Love without borders • Lanmou san fwontyè • Amor sin fronteras
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
