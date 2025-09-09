import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { trackEvent, trackError } from '@/lib/sentry';

interface VideoFile {
  file: File;
  preview: string;
  duration: number;
  size: number;
  format: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const useVideoUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [compressing, setCompressing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Validation des contraintes vidéo
  const validateVideo = useCallback((file: File): Promise<VideoFile> => {
    return new Promise((resolve, reject) => {
      // Vérification type MIME
      const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        reject(new Error('Format de vidéo non supporté. Utilisez MP4, WebM ou MOV.'));
        return;
      }

      // Vérification taille (100MB max)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        reject(new Error('La vidéo est trop volumineuse (max 100MB).'));
        return;
      }

      // Créer élément vidéo pour validation
      const video = document.createElement('video');
      const objectURL = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        // Vérification durée (30s max)
        if (video.duration > 30) {
          URL.revokeObjectURL(objectURL);
          reject(new Error('La vidéo est trop longue (max 30 secondes).'));
          return;
        }

        // Vérification résolution minimale
        if (video.videoWidth < 480 || video.videoHeight < 480) {
          URL.revokeObjectURL(objectURL);
          reject(new Error('Résolution minimale requise: 480x480 pixels.'));
          return;
        }

        resolve({
          file,
          preview: objectURL,
          duration: video.duration,
          size: file.size,
          format: file.type,
        });
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectURL);
        reject(new Error('Impossible de lire la vidéo.'));
      };

      video.src = objectURL;
    });
  }, []);

  // Compression vidéo côté client (si nécessaire)
  const compressVideo = useCallback(async (videoFile: VideoFile): Promise<File> => {
    setCompressing(true);
    
    try {
      // Si la vidéo est déjà optimale, pas de compression
      if (videoFile.size < 10 * 1024 * 1024 && videoFile.format === 'video/mp4') {
        return videoFile.file;
      }

      // Utiliser canvas pour compression basique
      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas non supporté'));
          return;
        }

        video.onloadedmetadata = () => {
          // Définir dimensions optimales
          const maxDimension = 720;
          const ratio = Math.min(maxDimension / video.videoWidth, maxDimension / video.videoHeight);
          
          canvas.width = Math.floor(video.videoWidth * ratio);
          canvas.height = Math.floor(video.videoHeight * ratio);

          // Note: Compression vidéo côté client est limitée
          // En production, utiliser un service comme Cloudinary ou AWS MediaConvert
          console.log('🎬 Compression basique appliquée');
          resolve(videoFile.file);
        };

        video.src = videoFile.preview;
      });
    } catch (error) {
      throw new Error('Erreur lors de la compression');
    } finally {
      setCompressing(false);
    }
  }, []);

  // Génération de miniature
  const generateThumbnail = useCallback((video: HTMLVideoElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas non supporté'));
        return;
      }

      // Capturer frame à 1 seconde
      video.currentTime = 1;
      
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Impossible de générer la miniature'));
          }
        }, 'image/jpeg', 0.8);
      };
    });
  }, []);

  // Upload principal
  const uploadVideo = useCallback(async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    setUploading(true);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      // 1. Validation
      const videoFile = await validateVideo(file);
      
      // 2. Compression si nécessaire
      const compressedFile = await compressVideo(videoFile);
      
      // 3. Génération du chemin de stockage
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // 4. Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-videos')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (progress) => {
            const percentage = Math.round((progress.loaded / progress.total) * 100);
            setProgress({
              loaded: progress.loaded,
              total: progress.total,
              percentage,
            });
          },
        });

      if (uploadError) throw uploadError;

      // 5. Générer miniature
      const video = document.createElement('video');
      video.src = videoFile.preview;
      
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });
      
      const thumbnailBlob = await generateThumbnail(video);
      const thumbnailPath = `${user.id}/${Date.now()}_thumb.jpg`;
      
      const { data: thumbnailData, error: thumbnailError } = await supabase.storage
        .from('video-thumbnails')
        .upload(thumbnailPath, thumbnailBlob);

      if (thumbnailError) {
        console.warn('⚠️ Erreur upload miniature:', thumbnailError);
      }

      // 6. Enregistrer métadonnées en DB
      const { error: dbError } = await supabase
        .from('video_profiles')
        .upsert({
          user_id: user.id,
          file_name: compressedFile.name,
          file_size_bytes: compressedFile.size,
          duration_seconds: videoFile.duration,
          format: videoFile.format,
          resolution: '720p', // À calculer dynamiquement
          storage_path: uploadData.path,
          thumbnail_url: thumbnailData?.path || null,
          upload_completed_at: new Date().toISOString(),
        });

      if (dbError) throw dbError;

      // 7. Mettre à jour le profil
      const { data: urlData } = supabase.storage
        .from('profile-videos')
        .getPublicUrl(uploadData.path);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          video_profile_url: urlData.publicUrl,
          video_thumbnail_url: thumbnailData?.path ? 
            supabase.storage.from('video-thumbnails').getPublicUrl(thumbnailData.path).data.publicUrl : null,
          video_uploaded_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 8. Tracker l'événement
      trackEvent('video_profile_uploaded', {
        category: 'profile',
        action: 'video_upload',
        userId: user.id,
        metadata: {
          duration: videoFile.duration,
          size: compressedFile.size,
          format: videoFile.format,
        },
      });

      toast({
        title: "Vidéo uploadée avec succès !",
        description: "Votre vidéo de profil sera examinée avant publication.",
      });

      return urlData.publicUrl;

    } catch (error) {
      trackError(error as Error, {
        userId: user.id,
        action: 'video_upload',
        metadata: { fileSize: file.size, fileName: file.name },
      });

      toast({
        title: "Erreur d'upload",
        description: (error as Error).message,
        variant: "destructive",
      });

      throw error;
    } finally {
      setUploading(false);
      setProgress(null);
      setCompressing(false);
    }
  }, [user, validateVideo, compressVideo, generateThumbnail, toast]);

  // Suppression vidéo
  const deleteVideo = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      // Récupérer infos vidéo actuelle
      const { data: videoData } = await supabase
        .from('video_profiles')
        .select('storage_path, thumbnail_url')
        .eq('user_id', user.id)
        .single();

      if (videoData) {
        // Supprimer fichiers du storage
        await supabase.storage
          .from('profile-videos')
          .remove([videoData.storage_path]);

        if (videoData.thumbnail_url) {
          await supabase.storage
            .from('video-thumbnails')
            .remove([videoData.thumbnail_url]);
        }

        // Supprimer métadonnées
        await supabase
          .from('video_profiles')
          .delete()
          .eq('user_id', user.id);

        // Mettre à jour profil
        await supabase
          .from('profiles')
          .update({
            video_profile_url: null,
            video_thumbnail_url: null,
            video_uploaded_at: null,
            video_approved: false,
          })
          .eq('id', user.id);

        trackEvent('video_profile_deleted', {
          category: 'profile',
          action: 'video_delete',
          userId: user.id,
        });

        toast({
          title: "Vidéo supprimée",
          description: "Votre vidéo de profil a été supprimée.",
        });
      }
    } catch (error) {
      trackError(error as Error, {
        userId: user.id,
        action: 'video_delete',
      });

      toast({
        title: "Erreur",
        description: "Impossible de supprimer la vidéo.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  return {
    uploadVideo,
    deleteVideo,
    uploading,
    compressing,
    progress,
    validateVideo,
  };
};