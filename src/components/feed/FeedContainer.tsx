/**
 * Conteneur principal du feed - Version simplifiée
 */

import { useState, useEffect } from 'react';
import { useInterestsFeed } from '@/hooks/useInterestsFeed';
import { FriendsSuggestions } from './FriendsSuggestions';

const FeedContainer = () => {
  const {
    posts,
    loading,
    error,
    refresh
  } = useInterestsFeed();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-lg">Chargement du feed...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={refresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header du feed */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900"> Fil d'actualité</h1>
          <p className="text-gray-600 mt-1">Posts personnalisés selon vos intérêts</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Feed principal */}
          <div className="lg:col-span-3">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Aucun post trouvé</h3>
                <p className="text-gray-600 mb-4">
                  Aucun post pertinent basé sur vos intérêts pour le moment.
                </p>
                <p className="text-sm text-gray-500">
                  Essayez de définir vos intérêts dans votre profil !
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {post.profiles?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {post.profiles?.full_name || 'Utilisateur'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>❤️ {post.likes_count || 0}</span>
                      <span>💬 {post.comments_count || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar avec suggestions d'amis */}
          <div className="lg:col-span-1">
            <FriendsSuggestions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedContainer;
