import { useState, useEffect } from "react";
import { Heart, Mail, Lock, ArrowLeft, KeyRound } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordInput } from "@/components/ui/password-input";
import { SignupForm } from "@/components/ui/signup-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingButton } from "@/components/ui/loading-button";
import { useLoader } from "@/hooks/use-loader";
import { analytics } from '@/lib/analytics';
import { authTranslations } from '@/lib/authTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from "@/components/ui/language-selector";

const Auth = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null);
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const t = authTranslations[selectedLanguage as keyof typeof authTranslations] || authTranslations.fr;

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Rediriger l'admin vers l'interface admin
        if (session.user.email === 'clodenerc@yahoo.fr') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    };

    // Vérifier si c'est un retour de confirmation d'email
    const checkEmailConfirmation = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        showLoader(t.emailConfirming, "heart");
        
        try {
          // Échanger les tokens pour obtenir une session
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            toast({
              title: t.error,
              description: t.emailConfirmError,
              variant: "destructive",
            });
          } else if (data.session) {
            toast({
              title: t.emailConfirmed,
              description: t.emailConfirmedDesc,
            });

            // Rediriger vers le dashboard
            if (data.user.email === 'clodenerc@yahoo.fr') {
              navigate('/admin');
            } else {
              navigate('/dashboard');
            }
          }
        } catch (error) {
          toast({
            title: t.error,
            description: t.generalError,
            variant: "destructive",
          });
        } finally {
          hideLoader();
        }
      } else {
        checkUser();
      }
    };

    checkEmailConfirmation();
  }, [navigate, searchParams, showLoader, hideLoader, toast, t]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    showLoader(t.loginLoading, "heart");
    
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        // Gestion spécifique des erreurs
        if (error.message.includes("Invalid login credentials")) {
          setLoginError(t.invalidCredentials);
        } else if (error.message.includes("Email not confirmed")) {
          setLoginError(t.emailNotConfirmed);
        } else if (error.message.includes("Too many requests")) {
          setLoginError("Trop de tentatives. Veuillez réessayer plus tard.");
        } else {
          setLoginError("Une erreur est survenue lors de la connexion.");
        }
      } else {
        // Connexion réussie
        toast({
          title: t.loginSuccess,
          description: t.loginSuccessDesc,
        });
        
        // ✅ SÉCURITÉ CORRIGÉE: Redirection intelligente selon le rôle
        // Vérification immédiate pour l'admin principal
        if (data.user.email === 'clodenerc@yahoo.fr') {
          console.log('🔑 Admin principal détecté, redirection vers /admin');
          navigate('/admin');
        } else {
          // Pour les autres utilisateurs, vérifier le rôle en base
          checkUserRoleAndRedirect(data.user);
        }
        
        async function checkUserRoleAndRedirect(user: any) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single();
              
            if (profile?.role === 'admin') {
              console.log('🔑 Admin en base détecté, redirection vers /admin');
              navigate('/admin');
            } else {
              console.log('👤 Utilisateur standard, redirection vers /dashboard');
              navigate('/dashboard');
            }
          } catch (error) {
            console.log('👤 Erreur vérification rôle, redirection par défaut vers /dashboard');
            navigate('/dashboard');
          }
        }
        // Tracker la connexion réussie
        analytics.userLogin('email');
      }
    } catch (error) {
      setLoginError("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  // �� NOUVELLE FONCTION: Gestion du mot de passe oublié
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordMessage(null);
    setForgotPasswordStatus('loading');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/auth?tab=reset-password`,
      });

      if (error) {
        setForgotPasswordStatus('error');
        setForgotPasswordMessage(t.forgotPasswordErrorDesc);
        toast({
          title: t.forgotPasswordError,
          description: t.forgotPasswordErrorDesc,
          variant: "destructive",
        });
      } else {
        setForgotPasswordStatus('success');
        setForgotPasswordMessage(t.forgotPasswordSuccessDesc);
        toast({
          title: t.forgotPasswordSuccess,
          description: t.forgotPasswordSuccessDesc,
        });
        setForgotPasswordEmail('');
      }
    } catch (error) {
      setForgotPasswordStatus('error');
      setForgotPasswordMessage(t.generalError);
      toast({
        title: t.error,
        description: t.generalError,
        variant: "destructive",
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur quand l'utilisateur modifie les champs
    if (loginError) {
      setLoginError(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      {/* ✅ AJOUT: Sélecteur de langue en haut à droite */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector 
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
      </div>

      {/* Bouton de retour */}
      <Link 
        to="/" 
        className="absolute top-4 left-4 z-10 flex items-center gap-2 text-[#212529] hover:text-[#E63946] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Retour à l'accueil</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Header - Mobile optimized */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-[#E63946] hover:text-[#E63946]/80 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm md:text-base">Retour à l'accueil</span>
          </Link>
        </div>

        {/* Auth Card - Mobile responsive */}
        <Card className="bg-[#F8F9FA] border-[#CED4DA] shadow-lg rounded-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-6 h-6 text-[#E63946]" />
              <CardTitle className="text-xl md:text-2xl text-[#212529]">{t.loginTitle}</CardTitle>
            </div>
            <CardDescription className="text-[#CED4DA]">
              {t.loginDescription}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-4 md:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#CED4DA]/20 rounded-lg p-1">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-[#E63946] data-[state=active]:text-white text-[#212529] rounded-md"
                >
                  {t.loginTab}
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-[#E63946] data-[state=active]:text-white text-[#212529] rounded-md"
                >
                  {t.signupTab}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-6">
                {!showForgotPassword ? (
                  <>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2 text-[#212529]">
                          <Mail className="w-4 h-4 text-[#E63946]" />
                          {t.email}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={loginData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                          className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password" className="flex items-center gap-2 text-[#212529]">
                          <Lock className="w-4 h-4 text-[#E63946]" />
                          {t.password}
                        </Label>
                        <PasswordInput
                          value={loginData.password}
                          onChange={(value) => handleInputChange("password", value)}
                          placeholder={t.passwordPlaceholder}
                          required
                          className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]"
                        />
                      </div>

                      {loginError && (
                        <div className="text-sm text-[#E63946] bg-[#E63946]/10 border border-[#E63946]/20 p-3 rounded-md">
                          {loginError}
                        </div>
                      )}
                      
                      <LoadingButton
                        type="submit"
                        loading={loading}
                        className="w-full bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0"
                      >
                        {t.loginButton}
                      </LoadingButton>
                    </form>

                    {/* 🔑 AJOUT: Bouton Mot de passe oublié */}
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-[#E63946] hover:text-[#E63946]/80 hover:bg-[#E63946]/10 flex items-center gap-2 mx-auto"
                      >
                        <KeyRound className="w-4 h-4" />
                        {t.forgotPassword}
                      </Button>
                    </div>
                  </>
                ) : (
                  /* 🔑 AJOUT: Formulaire de mot de passe oublié */
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <KeyRound className="w-8 h-8 text-[#E63946] mx-auto mb-2" />
                      <h3 className="text-lg font-semibold text-[#212529]">{t.forgotPasswordTitle}</h3>
                      <p className="text-sm text-[#CED4DA]">
                        {t.forgotPasswordDescription}
                      </p>
                    </div>

                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email" className="flex items-center gap-2 text-[#212529]">
                          <Mail className="w-4 h-4 text-[#E63946]" />
                          {t.email}
                        </Label>
                        <Input
                          id="forgot-email"
                          type="email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          placeholder={t.email}
                          required
                          className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]"
                        />
                      </div>

                      {forgotPasswordMessage && (
                        <div className={`text-sm p-3 rounded-md ${
                          forgotPasswordStatus === 'success' 
                            ? 'text-green-700 bg-green-50 border border-green-200' 
                            : 'text-[#E63946] bg-[#E63946]/10 border border-[#E63946]/20'
                        }`}>
                          {forgotPasswordMessage}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowForgotPassword(false);
                            setForgotPasswordMessage(null);
                            setForgotPasswordEmail('');
                            setForgotPasswordStatus('idle');
                          }}
                          className="flex-1 border-[#CED4DA] text-[#212529] hover:bg-[#CED4DA]/20"
                        >
                          {t.cancel}
                        </Button>
                        <LoadingButton
                          type="submit"
                          loading={forgotPasswordLoading}
                          className="flex-1 bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0"
                        >
                          {t.sendLink}
                        </LoadingButton>
                      </div>
                    </form>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="signup" className="mt-6">
                <div className="max-h-[70vh] overflow-y-auto">
                  <SignupForm language={selectedLanguage} onClose={() => setActiveTab("login")} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;