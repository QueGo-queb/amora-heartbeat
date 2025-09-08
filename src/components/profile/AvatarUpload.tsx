// src/components/profile/AvatarUpload.tsx
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarUpdate?: (newUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  onAvatarUpdate,
  size = 'md' 
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const uploadAvatar = async (file: File) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour télécharger une photo",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);

      // Valider le fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('La taille du fichier ne doit pas dépasser 5MB');
      }

      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Si le bucket n'existe pas, créer un fallback avec URL data
        console.warn('Storage upload failed, using fallback:', uploadError);
        const reader = new FileReader();
        reader.onload = async (e) => {
          const dataUrl = e.target?.result as string;
          setPreviewUrl(dataUrl);
          
          // Mettre à jour le profil avec l'URL temporaire
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: dataUrl })
            .eq('user_id', user.id);

          if (updateError) throw updateError;
          
          onAvatarUpdate?.(dataUrl);
          toast({
            title: "Succès",
            description: "Photo de profil mise à jour avec succès!"
          });
        };
        reader.readAsDataURL(file);
        return;
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      // Mettre à jour le profil avec la nouvelle URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Supprimer l'ancienne image si elle existe
      if (currentAvatarUrl && currentAvatarUrl.includes('user-content')) {
        const oldPath = currentAvatarUrl.split('/').slice(-2).join('/');
        if (oldPath) {
          await supabase.storage
            .from('user-content')
            .remove([oldPath]);
        }
      }

      setPreviewUrl(publicUrl);
      onAvatarUpdate?.(publicUrl);

      toast({
        title: "Succès",
        description: "Photo de profil mise à jour avec succès!"
      });

    } catch (error: any) {
      console.error('Erreur upload avatar:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du téléchargement",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  const removeAvatar = async () => {
    if (!user) return;

    try {
      setUploading(true);

      // Supprimer de Supabase Storage (si c'est une URL de storage)
      if (currentAvatarUrl && currentAvatarUrl.includes('user-content')) {
        const oldPath = currentAvatarUrl.split('/').slice(-2).join('/');
        if (oldPath) {
          await supabase.storage
            .from('user-content')
            .remove([oldPath]);
        }
      }

      // Mettre à jour le profil
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);

      if (error) throw error;

      setPreviewUrl(null);
      onAvatarUpdate?.(null);

      toast({
        title: "Succès",
        description: "Photo de profil supprimée"
      });

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      <Card className="p-4">
        <div className={`relative ${sizeClasses[size]} mx-auto`}>
          {displayUrl ? (
            <>
              <img
                src={displayUrl}
                alt="Photo de profil"
                className="w-full h-full object-cover rounded-full border-2 border-gray-200"
                onError={(e) => {
                  console.error('Error loading avatar image');
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              {!uploading && (
                <button
                  onClick={removeAvatar}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </>
          ) : (
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
              <Camera size={size === 'sm' ? 16 : size === 'md' ? 24 : 32} className="text-gray-400" />
            </div>
          )}
          
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <Loader2 size={24} className="text-white animate-spin" />
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          size="sm"
          variant="outline"
        >
          <Upload size={16} className="mr-2" />
          {displayUrl ? 'Changer' : 'Ajouter'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploading && (
        <p className="text-sm text-gray-500">Téléchargement en cours...</p>
      )}
    </div>
  );
}
