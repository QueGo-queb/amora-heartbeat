import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Upload, Play, Trash2, CheckCircle, Clock } from 'lucide-react';
import { useVideoUploader } from '@/hooks/useVideoUploader';
import { cn } from '@/lib/utils';

interface VideoProfileUploaderProps {
  currentVideoUrl?: string;
  currentThumbnailUrl?: string;
  approved?: boolean;
  onUploadComplete?: (url: string) => void;
  className?: string;
}

export const VideoProfileUploader: React.FC<VideoProfileUploaderProps> = ({
  currentVideoUrl,
  currentThumbnailUrl,
  approved = false,
  onUploadComplete,
  className,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const {
    uploadVideo,
    deleteVideo,
    uploading,
    compressing,
    progress,
    validateVideo,
  } = useVideoUploader();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);

    try {
      // Validation et preview
      const videoFile = await validateVideo(file);
      setPreview(videoFile.preview);
      
      // Upload
      const url = await uploadVideo(file);
      
      // Callback parent
      onUploadComplete?.(url);
      
    } catch (err) {
      setError((err as Error).message);
      setPreview(null);
    }
  }, [validateVideo, uploadVideo, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
      'video/quicktime': ['.mov'],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
    disabled: uploading || compressing,
  });

  const handleDelete = async () => {
    try {
      await deleteVideo();
      setPreview(null);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    setError(null);
  };

  // Status de la vidéo actuelle
  const getVideoStatus = () => {
    if (currentVideoUrl && approved) {
      return { status: 'approved', label: 'Approuvée', icon: CheckCircle, color: 'text-green-600' };
    }
    if (currentVideoUrl && !approved) {
      return { status: 'pending', label: 'En attente', icon: Clock, color: 'text-yellow-600' };
    }
    return { status: 'none', label: 'Aucune vidéo', icon: Upload, color: 'text-gray-400' };
  };

  const videoStatus = getVideoStatus();

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Vidéo de profil
        </CardTitle>
        <CardDescription>
          Uploadez une vidéo courte (max 30s) pour améliorer votre profil de matching.
          Formats supportés: MP4, WebM, MOV.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Statut actuel */}
        {currentVideoUrl && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <videoStatus.icon className={cn('h-5 w-5', videoStatus.color)} />
              <div>
                <p className="font-medium">Vidéo actuelle: {videoStatus.label}</p>
                {!approved && (
                  <p className="text-sm text-gray-600">
                    Votre vidéo est en cours de modération
                  </p>
                )}
              </div>
            </div>
            
            {currentThumbnailUrl && (
              <div className="relative">
                <img 
                  src={currentThumbnailUrl}
                  alt="Miniature vidéo"
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded">
                  <Play className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Zone d'upload */}
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragActive && !isDragReject && 'border-blue-400 bg-blue-50',
            isDragReject && 'border-red-400 bg-red-50',
            (uploading || compressing) && 'opacity-50 cursor-not-allowed',
            !isDragActive && !isDragReject && 'border-gray-300 hover:border-gray-400'
          )}
        >
          <input {...getInputProps()} />
          
          {compressing ? (
            <div className="space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
              <p className="text-gray-600">Compression de la vidéo...</p>
            </div>
          ) : uploading ? (
            <div className="space-y-3">
              <Upload className="h-8 w-8 text-blue-600 mx-auto" />
              <p className="text-gray-600">Upload en cours...</p>
              {progress && (
                <div className="space-y-2">
                  <Progress value={progress.percentage} className="w-full" />
                  <p className="text-sm text-gray-500">
                    {progress.percentage}% ({Math.round(progress.loaded / 1024 / 1024)}MB / {Math.round(progress.total / 1024 / 1024)}MB)
                  </p>
                </div>
              )}
            </div>
          ) : isDragActive ? (
            isDragReject ? (
              <div className="space-y-3">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                <p className="text-red-600">Format de fichier non supporté</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-8 w-8 text-blue-600 mx-auto" />
                <p className="text-blue-600">Déposez votre vidéo ici</p>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
              <div>
                <p className="text-gray-600">
                  Glissez-déposez votre vidéo ici, ou{' '}
                  <span className="text-blue-600 font-medium">cliquez pour sélectionner</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  MP4, WebM ou MOV - Max 30 secondes, 100MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Preview vidéo */}
        {preview && (
          <div className="space-y-3">
            <h4 className="font-medium">Prévisualisation:</h4>
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                src={preview}
                controls
                className="w-full max-h-64 object-contain"
                onLoadedMetadata={(e) => {
                  const video = e.target as HTMLVideoElement;
                  console.log(`Durée: ${video.duration.toFixed(1)}s, Résolution: ${video.videoWidth}x${video.videoHeight}`);
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={clearPreview} variant="outline" size="sm">
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Erreurs */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        {currentVideoUrl && !preview && (
          <div className="flex gap-2 pt-4">
            <Button onClick={handleDelete} variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer la vidéo
            </Button>
          </div>
        )}

        {/* Conseils */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Conseils pour une bonne vidéo:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Éclairage naturel de face</li>
            <li>• Parlez clairement et souriez</li>
            <li>• Montrez votre personnalité</li>
            <li>• Évitez les arrière-plans distrayants</li>
            <li>• Position verticale ou carrée recommandée</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
