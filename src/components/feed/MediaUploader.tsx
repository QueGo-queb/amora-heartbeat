/**
 * ✅ Composant pour l'upload de médias (images et vidéos)
 */

import { useState, useRef } from 'react';
import { Upload, X, Image, Video, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface MediaFile {
  type: 'image' | 'video' | 'file';
  url: string;
  path: string;
  content_type: string;
  file: File;
}

interface MediaUploaderProps {
  onMediaUploaded: (media: MediaFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // en MB
}

export function MediaUploader({ onMediaUploaded, maxFiles = 4, maxFileSize = 10 }: MediaUploaderProps) {
  const [uploadedMedia, setUploadedMedia] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || !user) return;

    const fileArray = Array.from(files);
    
    // Vérifier le nombre de fichiers
    if (uploadedMedia.length + fileArray.length > maxFiles) {
      toast({
        title: "Trop de fichiers",
        description: `Vous ne pouvez uploader que ${maxFiles} fichiers maximum.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = fileArray.map(async (file) => {
        // Vérifier la taille du fichier
        if (file.size > maxFileSize * 1024 * 1024) {
          throw new Error(`Le fichier ${file.name} est trop volumineux (max ${maxFileSize}MB)`);
        }

        // Vérifier le type de fichier
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          throw new Error(`Le fichier ${file.name} n'est pas un média valide`);
        }

        // Générer un nom de fichier unique
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Uploader vers Supabase Storage
        const { data, error } = await supabase.storage
          .from('post-media')
          .upload(filePath, file, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Générer l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('post-media')
          .getPublicUrl(filePath);

        const mediaFile: MediaFile = {
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: publicUrl,
          path: filePath,
          content_type: file.type,
          file: file
        };

        return mediaFile;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const newMedia = [...uploadedMedia, ...uploadedFiles];
      
      setUploadedMedia(newMedia);
      onMediaUploaded(newMedia);

      toast({
        title: "Médias uploadés !",
        description: `${uploadedFiles.length} fichier(s) ajouté(s) à votre post.`,
      });

    } catch (error: any) {
      console.error('Erreur upload:', error);
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible d'uploader les fichiers.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    const newMedia = uploadedMedia.filter((_, i) => i !== index);
    setUploadedMedia(newMedia);
    onMediaUploaded(newMedia);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Zone d'upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">
          Glissez vos images/vidéos ici ou cliquez pour sélectionner
        </p>
        <p className="text-xs text-gray-500">
          Max {maxFiles} fichiers, {maxFileSize}MB par fichier
        </p>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || uploadedMedia.length >= maxFiles}
          className="mt-2"
        >
          {uploading ? "Upload en cours..." : "Sélectionner des fichiers"}
        </Button>
      </div>

      {/* Prévisualisation des médias uploadés */}
      {uploadedMedia.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {uploadedMedia.map((media, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                )}
              </div>
              
              {/* Bouton de suppression */}
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeMedia(index)}
              >
                <X className="w-3 h-3" />
              </Button>
              
              {/* Info du fichier */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                <div className="flex items-center gap-1">
                  {getFileIcon(media.content_type)}
                  <span className="truncate">{media.file.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}