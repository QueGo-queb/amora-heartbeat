/**
 * Utilitaires pour gérer les médias avec fallback
 * Supporte le nouveau système media JSONB et les anciennes colonnes
 */

import type { MediaItem } from '../types/feed';

/**
 * Récupère les médias d'un post avec fallback vers les anciennes colonnes
 */
export function getPostMedia(post: any): MediaItem[] {
  // ✅ Priorité 1: Nouveau système media JSONB
  if (post.media && Array.isArray(post.media) && post.media.length > 0) {
    return post.media.map((item: any) => ({
      type: item.type || 'image',
      url: item.url,
      thumbnail: item.thumbnail,
      alt: item.alt || 'Média du post',
      duration: item.duration,
      width: item.width,
      height: item.height
    }));
  }

  // ✅ Priorité 2: Anciennes colonnes media_urls + media_types
  if (post.media_urls && Array.isArray(post.media_urls) && post.media_urls.length > 0) {
    return post.media_urls.map((url: string, index: number) => ({
      type: (post.media_types?.[index] as 'image' | 'video' | 'gif') || 'image',
      url,
      alt: 'Média du post'
    }));
  }

  // ✅ Priorité 3: Anciennes colonnes image_url et video_url
  const mediaItems: MediaItem[] = [];
  
  if (post.image_url && post.image_url.trim()) {
    mediaItems.push({
      type: 'image',
      url: post.image_url,
      alt: 'Image du post'
    });
  }
  
  if (post.video_url && post.video_url.trim()) {
    mediaItems.push({
      type: 'video',
      url: post.video_url,
      alt: 'Vidéo du post'
    });
  }

  return mediaItems;
}

/**
 * Vérifie si un post contient des médias
 */
export function hasMedia(post: any): boolean {
  return getPostMedia(post).length > 0;
}

/**
 * Récupère le premier média d'un post (pour l'aperçu)
 */
export function getFirstMedia(post: any): MediaItem | null {
  const media = getPostMedia(post);
  return media.length > 0 ? media[0] : null;
}

/**
 * Récupère tous les médias d'un type spécifique
 */
export function getMediaByType(post: any, type: 'image' | 'video' | 'gif'): MediaItem[] {
  return getPostMedia(post).filter(item => item.type === type);
}

/**
 * Convertit les anciennes données vers le nouveau format JSONB
 */
export function convertToNewMediaFormat(post: any): MediaItem[] {
  const mediaItems: MediaItem[] = [];

  // Ajouter image_url si présent
  if (post.image_url && post.image_url.trim()) {
    mediaItems.push({
      type: 'image',
      url: post.image_url,
      alt: 'Image du post'
    });
  }

  // Ajouter video_url si présent
  if (post.video_url && post.video_url.trim()) {
    mediaItems.push({
      type: 'video',
      url: post.video_url,
      alt: 'Vidéo du post'
    });
  }

  // Ajouter media_urls si présents
  if (post.media_urls && Array.isArray(post.media_urls)) {
    post.media_urls.forEach((url: string, index: number) => {
      if (url && url.trim()) {
        mediaItems.push({
          type: (post.media_types?.[index] as 'image' | 'video' | 'gif') || 'image',
          url,
          alt: 'Média du post'
        });
      }
    });
  }

  return mediaItems;
}

/**
 * Valide qu'un élément média est correct
 */
export function validateMediaItem(item: any): item is MediaItem {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.url === 'string' &&
    item.url.trim().length > 0 &&
    ['image', 'video', 'gif'].includes(item.type)
  );
}

/**
 * Nettoie et valide une liste de médias
 */
export function sanitizeMediaItems(items: any[]): MediaItem[] {
  if (!Array.isArray(items)) return [];
  
  return items
    .filter(validateMediaItem)
    .map(item => ({
      type: item.type,
      url: item.url.trim(),
      thumbnail: item.thumbnail?.trim() || undefined,
      alt: item.alt?.trim() || 'Média du post',
      duration: typeof item.duration === 'number' ? item.duration : undefined,
      width: typeof item.width === 'number' ? item.width : undefined,
      height: typeof item.height === 'number' ? item.height : undefined
    }));
}

/**
 * Génère une URL de thumbnail pour une vidéo si elle n'existe pas
 */
export function generateVideoThumbnail(videoUrl: string): string | undefined {
  // Pour les vidéos YouTube
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
  }
  
  // Pour les vidéos Vimeo
  if (videoUrl.includes('vimeo.com')) {
    const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
    if (videoId) {
      return `https://vumbnail.com/${videoId}.jpg`;
    }
  }
  
  return undefined;
}

/**
 * Détermine le type de média basé sur l'URL
 */
export function detectMediaType(url: string): 'image' | 'video' | 'gif' {
  const extension = url.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(extension || '')) {
    return 'image';
  }
  
  if (['gif'].includes(extension || '')) {
    return 'gif';
  }
  
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(extension || '') ||
      url.includes('youtube.com') || url.includes('youtu.be') || 
      url.includes('vimeo.com') || url.includes('dailymotion.com')) {
    return 'video';
  }
  
  // Par défaut, considérer comme image
  return 'image';
}

/**
 * Crée un objet MediaItem à partir d'une URL
 */
export function createMediaItemFromUrl(url: string, alt?: string): MediaItem {
  const type = detectMediaType(url);
  
  return {
    type,
    url,
    alt: alt || 'Média du post',
    thumbnail: type === 'video' ? generateVideoThumbnail(url) : undefined
  };
}