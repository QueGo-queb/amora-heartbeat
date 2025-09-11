// src/components/profile/AvatarUpload.tsx
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Video, Image } from 'lucide-react';
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
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  // Fonction pour compresser une image
  const compressImage = (file: File, maxSizeKB: number = 500): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculer les nouvelles dimensions (max 800x800)
        const maxDimension = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir en blob avec compression
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            
            // Vérifier la taille et recompresser si nécessaire
            if (compressedFile.size > maxSizeKB * 1024) {
              // Recompresser avec une qualité plus faible
              canvas.toBlob((recompressedBlob) => {
                if (recompressedBlob) {
                  const finalFile = new File([recompressedBlob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  });
                  resolve(finalFile);
                }
              }, 'image/jpeg', 0.7);
            } else {
              resolve(compressedFile);
            }
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Fonction pour capturer une photo depuis la caméra
  const capturePhoto = () => {
    if (!cameraVideoRef.current || !canvasRef.current) return;
    
    const video = cameraVideoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // Définir la taille du canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dessiner l'image de la vidéo sur le canvas
    ctx.drawImage(video, 0, 0);
    
    // Convertir en blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-photo.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        // Compresser et uploader
        compressAndUpload(file);
      }
    }, 'image/jpeg', 0.8);
    
    // Fermer la caméra
    stopCamera();
    setShowCameraModal(false);
  };

  // Fonction pour démarrer la caméra
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 800 },
          height: { ideal: 600 }
        } 
      });
      
      setCameraStream(stream);
      setShowCameraModal(true);
      
      // Attendre que la vidéo soit prête
      setTimeout(() => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
      }, 100);
      
    } catch (error) {
      console.error('Erreur accès caméra:', error);
      toast({
        title: "Erreur caméra",
        description: "Impossible d'accéder à la caméra. Vérifiez les permissions.",
        variant: "destructive"
      });
    }
  };

  // Fonction pour arrêter la caméra
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Fonction pour compresser et uploader
  const compressAndUpload = async (file: File) => {
    try {
      setUploading(true);
      
      // Compresser l'image
      const compressedFile = await compressImage(file, 500); // 500KB max
      
      console.log(`📊 Compression: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`);
      
      // Uploader le fichier compressé
      await uploadAvatar(compressedFile);
      
    } catch (error) {
      console.error('Erreur compression:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la compression de l'image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
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

      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop() || 'jpg';
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
            .eq('id', user.id);

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
        .eq('id', user.id);

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
      compressAndUpload(file);
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
        .eq('id', user.id);

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
          <Image size={16} className="mr-2" />
          {displayUrl ? 'Changer' : 'Ajouter'}
        </Button>
        
        <Button
          onClick={startCamera}
          disabled={uploading}
          size="sm"
          variant="outline"
        >
          <Video size={16} className="mr-2" />
          Caméra
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

      {/* Modal pour la caméra */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Prendre une photo
            </h3>
            
            <div className="relative">
              <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-gray-200 rounded-lg"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
            </div>
            
            <div className="flex gap-3 mt-4">
              <Button
                onClick={capturePhoto}
                className="flex-1"
              >
                <Camera size={16} className="mr-2" />
                Prendre la photo
              </Button>
              
              <Button
                onClick={() => {
                  stopCamera();
                  setShowCameraModal(false);
                }}
                variant="outline"
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
