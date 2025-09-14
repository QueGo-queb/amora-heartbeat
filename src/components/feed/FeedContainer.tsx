/**
 * Conteneur principal du feed - VERSION FINALE ULTRA-ROBUSTE
 */

import { useState, useEffect } from 'react';
import { useInterestsFeed } from '@/hooks/useInterestsFeed';
import { FriendsSuggestions } from './FriendsSuggestions';
import { PostCreator } from './PostCreator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { Button } from '@/components/ui/button';
import { Plus, Edit3 } from 'lucide-react';

const FeedContainer = () => {
  const { user, loading: authLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [forceExpandPostCreator, setForceExpandPostCreator] = useState(false);
  const { preloadCriticalData } = usePerformanceOptimization();
  const {
    posts,
    loading,
    error,
    refresh
  } = useInterestsFeed();

  // Debug et vérification de l'état d'authentification
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        setDebugInfo({
          session: !!session,
          sessionUser: session?.user?.email || null,
          currentUser: currentUser?.email || null,
          hookUser: user?.email || null,
          authLoading,
          timestamp: new Date().toLocaleTimeString(),
          userExists: !!user,
          canPublish: !!user && !authLoading
        });
      } catch (error) {
        console.error('Erreur debug auth:', error);
      }
    };

    checkAuthStatus();
  }, [user, authLoading]);

  // Précharger les données critiques
  useEffect(() => {
    preloadCriticalData();
  }, [preloadCriticalData]);

  // Fonction pour ouvrir le formulaire de création
  const openPostCreator = () => {
    console.log('🎯 Bouton cliqué !');
    setForceExpandPostCreator(true);
    // Faire défiler vers le formulaire de création
    setTimeout(() => {
      const createForm = document.querySelector('[data-post-creator]');
      if (createForm) {
        createForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Focus sur le textarea après un petit délai
        setTimeout(() => {
          const textarea = createForm.querySelector('textarea');
          if (textarea) textarea.focus();
        }, 800);
      }
    }, 100);
  };

  // Reset du flag après utilisation
  useEffect(() => {
    if (forceExpandPostCreator) {
      const timer = setTimeout(() => {
        setForceExpandPostCreator(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [forceExpandPostCreator]);

  console.log('🎯 FeedContainer DEBUG:', debugInfo);
  console.log('🔍 DEBUG FeedContainer:');
  console.log('- authLoading:', authLoading);
  console.log('- user:', user);
  console.log('- debugInfo:', debugInfo);
  console.log('- Condition PostCreator:', !authLoading && user);
  console.log('- Condition bouton header:', !authLoading && user);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📱 Fil d'actualité</h1>
              <p className="text-gray-600 mt-1">Découvrez les dernières publications</p>
            </div>
            
            {/* DEBUG: Affichage des conditions */}
            <div className="text-xs text-gray-500 mr-4">
              <div>authLoading: {authLoading ? 'true' : 'false'}</div>
              <div>user: {user ? user.email : 'null'}</div>
              <div>condition: {(!authLoading && user) ? 'true' : 'false'}</div>
            </div>
            
            {/* NOUVEAU : Bouton de création de publication visible en permanence */}
            {!authLoading && user ? (
              <Button
                onClick={openPostCreator}
                className="bg-gradient-to-r from-[#E63946] to-[#52B788] hover:from-[#D62828] hover:to-[#40916C] text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle publication
              </Button>
            ) : (
              <div className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                {authLoading ? 'Chargement...' : 'Non connecté'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* DEBUG INFO EN DÉVELOPPEMENT */}
            {process.env.NODE_ENV === 'development' && debugInfo.hookUser && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-xs">
                <h4 className="font-semibold mb-2 text-green-800">✅ État d'authentification</h4>
                <div className="grid grid-cols-2 gap-2 text-green-700">
                  <div>Utilisateur: {debugInfo.hookUser}</div>
                  <div>Peut publier: {debugInfo.canPublish ? 'Oui' : 'Non'}</div>
                  <div>Auth loading: {debugInfo.authLoading ? 'Oui' : 'Non'}</div>
                  <div>Session: {debugInfo.session ? 'Active' : 'Inactive'}</div>
                </div>
              </div>
            )}

            {/* ÉTAT DE CHARGEMENT AUTHENTIFICATION */}
            {authLoading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                  <p className="text-blue-700">🔄 Vérification de l'authentification...</p>
                </div>
              </div>
            )}

            {/* BOUTON DE CRÉATION - TOUJOURS VISIBLE SI CONNECTÉ */}
            {!authLoading && user && (
              <div className="space-y-4" data-post-creator>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-green-700 text-sm font-medium">
                      ✅ Connecté en tant que: {user.email}
                    </p>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      Prêt à publier
                    </span>
                  </div>
                </div>
                
                {/* COMPOSANT DE CRÉATION DE POST */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <PostCreator 
                    onPostCreated={refresh} 
                    forceExpanded={forceExpandPostCreator}
                  />
                </div>
              </div>
            )}

            {/* INVITATION À SE CONNECTER */}
            {!authLoading && !user && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">🔐 Rejoignez la conversation</h3>
                  <p className="text-gray-600 mb-4">
                    Connectez-vous pour publier dans le fil d'actualité et interagir avec la communauté.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => window.location.href = '/auth'}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Se connecter
                    </button>
                    <button
                      onClick={() => window.location.href = '/auth?mode=signup'}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      S'inscrire
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAT DE CHARGEMENT DES POSTS */}
            {loading && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3"></div>
                  <p className="text-gray-600">🔄 Chargement des posts...</p>
                </div>
              </div>
            )}

            {/* GESTION DES ERREURS */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="text-red-600 mr-3">❌</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800 mb-1">Erreur de chargement</h4>
                    <p className="text-red-700 text-sm mb-3">{error}</p>
                    <button 
                      onClick={refresh}
                      className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AUCUN POST DISPONIBLE - MESSAGE AMÉLIORÉ */}
            {!loading && !error && posts && posts.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Soyez le premier à publier !</h3>
                <p className="text-gray-600 mb-6">
                  Aucun post pour le moment. 
                  {user ? ' Partagez vos pensées avec la communauté !' : ' Connectez-vous pour commencer à publier.'}
                </p>
                {user ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700 mb-3">
                        💡 Cliquez sur le bouton ci-dessous pour créer votre premier post !
                      </p>
                      <Button
                        onClick={openPostCreator}
                        className="bg-gradient-to-r from-[#E63946] to-[#52B788] hover:from-[#D62828] hover:to-[#40916C] text-white"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Créer le premier post
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => window.location.href = '/auth'}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Se connecter
                    </button>
                    <button
                      onClick={() => window.location.href = '/auth?mode=signup'}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      S'inscrire
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* LISTE DES POSTS */}
            {!loading && !error && posts && posts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Publications récentes ({posts.length})
                  </h3>
                  <button 
                    onClick={refresh}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    🔄 Actualiser
                  </button>
                </div>
                
                {posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {post.profiles?.avatar_url ? (
                            <img 
                              src={post.profiles.avatar_url} 
                              alt="" 
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">
                              {(post.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-semibold text-gray-900">
                              {post.profiles?.full_name || 'Utilisateur'}
                            </div>
                            <div className="text-sm text-gray-500">•</div>
                            <div className="text-sm text-gray-500">
                              {new Date(post.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <p className="text-gray-900 leading-relaxed mb-4">{post.content}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                              <span>❤️</span>
                              <span>{post.likes_count || 0}</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                              <span>💬</span>
                              <span>{post.comments_count || 0}</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
                              <span>🔄</span>
                              <span>Partager</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <FriendsSuggestions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedContainer;
