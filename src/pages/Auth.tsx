import { useState, useEffect } from "react";
import { Heart, Mail, Lock, ArrowLeft } from "lucide-react";
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

const Auth = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("login");
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

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
        showLoader("Confirmation de votre email...", "heart");
        
        try {
          // Échanger les tokens pour obtenir une session
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            toast({
              title: "Erreur",
              description: "Impossible de confirmer votre email. Veuillez réessayer.",
              variant: "destructive",
            });
          } else if (data.session) {
            toast({
              title: "Email confirmé",
              description: "Votre compte a été activé avec succès !",
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
            title: "Erreur",
            description: "Une erreur est survenue lors de la confirmation.",
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
  }, [navigate, searchParams, showLoader, hideLoader, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    showLoader("Connexion en cours...", "heart");
    
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        // Gestion spécifique des erreurs
        if (error.message.includes("Invalid login credentials")) {
          setLoginError("Email ou mot de passe incorrect.");
        } else if (error.message.includes("Email not confirmed")) {
          setLoginError("Veuillez confirmer votre email avant de vous connecter.");
        } else if (error.message.includes("Too many requests")) {
          setLoginError("Trop de tentatives. Veuillez réessayer plus tard.");
        } else {
          setLoginError("Une erreur est survenue lors de la connexion.");
        }
      } else {
        // Connexion réussie
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
        
        // Rediriger selon le type d'utilisateur
        if (data.user.email === 'clodenerc@yahoo.fr') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
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

  const handleInputChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur quand l'utilisateur modifie les champs
    if (loginError) {
      setLoginError(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
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
              <CardTitle className="text-xl md:text-2xl text-[#212529]">Connexion</CardTitle>
            </div>
            <CardDescription className="text-[#CED4DA]">
              Connectez-vous à votre compte Amora
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-4 md:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#CED4DA]/20 rounded-lg p-1">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-[#E63946] data-[state=active]:text-white text-[#212529] rounded-md"
                >
                  Connexion
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-[#E63946] data-[state=active]:text-white text-[#212529] rounded-md"
                >
                  Inscription
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-[#212529]">
                      <Mail className="w-4 h-4 text-[#E63946]" />
                      Email
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
                      Mot de passe
                    </Label>
                    <PasswordInput
                      value={loginData.password}
                      onChange={(value) => handleInputChange("password", value)}
                      placeholder="Votre mot de passe"
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
                    Se connecter
                  </LoadingButton>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-6">
                <div className="max-h-[70vh] overflow-y-auto">
                  <SignupForm language="fr" onClose={() => setActiveTab("login")} />
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