import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, User, Shield, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const steps: OnboardingStep[] = [
    {
      id: 'email',
      title: 'Vérifiez votre email',
      description: 'Confirmez votre adresse email pour sécuriser votre compte',
      icon: <Mail className="w-6 h-6" />,
      completed: emailConfirmed
    },
    {
      id: 'privacy',
      title: 'Paramètres de confidentialité',
      description: 'Choisissez qui peut voir votre profil',
      icon: <Shield className="w-6 h-6" />,
      completed: false
    },
    {
      id: 'complete',
      title: 'Finalisation',
      description: 'Activez votre compte pour accéder à toutes les fonctionnalités',
      icon: <User className="w-6 h-6" />,
      completed: false
    }
  ];

  useEffect(() => {
    checkEmailConfirmation();
  }, [user]);

  const checkEmailConfirmation = async () => {
    if (user?.email_confirmed_at) {
      setEmailConfirmed(true);
      if (currentStep === 0) {
        setCurrentStep(1);
      }
    }
  };

  const handlePrivacyChange = (value: 'public' | 'friends' | 'private') => {
    setProfileVisibility(value);
  };

  const completeOnboarding = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Mettre à jour le profil avec les paramètres choisis
      const { error } = await supabase
        .from('profiles')
        .update({
          profile_visibility: profileVisibility,
          account_status: 'active'
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Compte activé !",
        description: "Votre compte est maintenant prêt à être utilisé.",
      });

      // Rediriger vers le dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Erreur",
        description: "Impossible de finaliser votre compte. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'Votre profil sera visible par tous les utilisateurs';
      case 'friends':
        return 'Seuls vos amis pourront voir votre profil complet';
      case 'private':
        return 'Votre profil sera privé et visible uniquement par vous';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Bienvenue sur AMORA ! 💖
            </CardTitle>
            <CardDescription className="text-lg">
              Finalisons la configuration de votre compte
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Progress Steps */}
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors
                    ${index <= currentStep 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'border-muted-foreground text-muted-foreground'
                    }
                  `}>
                    {step.completed ? <CheckCircle className="w-6 h-6" /> : step.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground max-w-24">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="bg-muted/50 rounded-lg p-6">
              {currentStep === 0 && (
                <div className="text-center space-y-4">
                  <Mail className="w-16 h-16 mx-auto text-primary" />
                  <h3 className="text-xl font-semibold">Vérifiez votre email</h3>
                  <p className="text-muted-foreground">
                    Nous avons envoyé un lien de confirmation à <strong>{user?.email}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cliquez sur le lien dans votre email pour continuer
                  </p>
                  {emailConfirmed && (
                    <Badge variant="secondary" className="text-green-700 bg-green-100">
                      ✅ Email confirmé !
                    </Badge>
                  )}
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Shield className="w-16 h-16 mx-auto text-primary mb-4" />
                    <h3 className="text-xl font-semibold">Paramètres de confidentialité</h3>
                    <p className="text-muted-foreground">
                      Choisissez qui peut voir votre profil
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Select value={profileVisibility} onValueChange={handlePrivacyChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir la visibilité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">🌍 Public - Visible par tous</SelectItem>
                        <SelectItem value="friends">👥 Amis - Visible par mes amis</SelectItem>
                        <SelectItem value="private">🔒 Privé - Visible par moi uniquement</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        {getVisibilityDescription(profileVisibility)}
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setCurrentStep(2)} 
                    className="w-full"
                    size="lg"
                  >
                    Continuer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="text-center space-y-6">
                  <User className="w-16 h-16 mx-auto text-primary" />
                  <h3 className="text-xl font-semibold">Prêt à commencer !</h3>
                  <p className="text-muted-foreground">
                    Votre compte est configuré avec les paramètres suivants :
                  </p>
                  
                  <div className="bg-white p-4 rounded-lg border space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Email :</span>
                      <Badge variant="secondary">✅ Confirmé</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Confidentialité :</span>
                      <Badge variant="outline">{profileVisibility}</Badge>
                    </div>
                  </div>

                  <Button 
                    onClick={completeOnboarding}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Activation en cours...
                      </>
                    ) : (
                      <>
                        Activer mon compte
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
