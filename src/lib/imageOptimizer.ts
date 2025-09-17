/**
 * ✅ SYSTÈME DE COMPRESSION D'IMAGES INTELLIGENT
 * Optimise automatiquement les images selon le contexte
 */

interface ImageOptimizationConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'webp' | 'jpeg' | 'png';
  progressive: boolean;
}

class ImageOptimizer {
  private static instance: ImageOptimizer;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  // Configurations par contexte
  private configs: Record<string, ImageOptimizationConfig> = {
    // Avatars - petits et légers
    avatar: {
      maxWidth: 150,
      maxHeight: 150,
      quality: 0.8,
      format: 'webp',
      progressive: true
    },
    
    // Posts - taille moyenne
    post: {
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.85,
      format: 'webp',
      progressive: true
    },
    
    // Galerie - haute qualité
    gallery: {
      maxWidth: 1200,
      maxHeight: 800,
      quality: 0.9,
      format: 'webp',
      progressive: true
    },
    
    // Thumbnails - très petits
    thumbnail: {
      maxWidth: 300,
      maxHeight: 200,
      quality: 0.7,
      format: 'webp',
      progressive: true
    }
  };

  // Optimiser une image
  async optimizeImage(
    file: File, 
    context: keyof typeof ImageOptimizer.prototype.configs = 'post'
  ): Promise<{
    optimizedFile: File;
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
  }> {
    const config = this.configs[context];
    if (!config) {
      throw new Error(`Configuration non trouvée pour le contexte: ${context}`);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        try {
          // Calculer les nouvelles dimensions
          const { width, height } = this.calculateDimensions(
            img.width, 
            img.height, 
            config.maxWidth, 
            config.maxHeight
          );

          // Configurer le canvas
          this.canvas.width = width;
          this.canvas.height = height;

          // Dessiner l'image redimensionnée
          this.ctx.drawImage(img, 0, 0, width, height);

          // Convertir en blob optimisé
          this.canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Erreur lors de la conversion'));
                return;
              }

              // Créer le fichier optimisé
              const optimizedFile = new File(
                [blob], 
                this.generateOptimizedFileName(file.name, config.format),
                { type: `image/${config.format}` }
              );

              const originalSize = file.size;
              const optimizedSize = blob.size;
              const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

              URL.revokeObjectURL(url);

              resolve({
                optimizedFile,
                originalSize,
                optimizedSize,
                compressionRatio
              });
            },
            `image/${config.format}`,
            config.quality
          );
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Erreur lors du chargement de l\'image'));
      };

      img.src = url;
    });
  }

  // Calculer les dimensions optimales
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Redimensionner proportionnellement
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  // Générer un nom de fichier optimisé
  private generateOptimizedFileName(originalName: string, format: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExt}_optimized.${format}`;
  }

  // Optimiser plusieurs images en parallèle
  async optimizeImages(
    files: File[],
    context: keyof typeof ImageOptimizer.prototype.configs = 'post'
  ): Promise<Array<{
    originalFile: File;
    optimizedFile: File;
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
  }>> {
    const results = await Promise.allSettled(
      files.map(async (file) => {
        const result = await this.optimizeImage(file, context);
        return {
          originalFile: file,
          ...result
        };
      })
    );

    return results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);
  }

  // Détecter le type d'image optimal
  detectOptimalFormat(file: File): 'webp' | 'jpeg' | 'png' {
    const type = file.type.toLowerCase();
    
    if (type.includes('png') && file.size > 100000) { // > 100KB
      return 'webp'; // PNG volumineux -> WebP
    }
    
    if (type.includes('jpeg') || type.includes('jpg')) {
      return 'webp'; // JPEG -> WebP
    }
    
    if (type.includes('gif')) {
      return 'webp'; // GIF -> WebP
    }
    
    return 'webp'; // Par défaut WebP
  }

  // Obtenir les statistiques d'optimisation
  getOptimizationStats(results: Array<{
    originalSize: number;
    optimizedSize: number;
  }>): {
    totalOriginalSize: number;
    totalOptimizedSize: number;
    totalSavings: number;
    averageCompressionRatio: number;
  } {
    const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalOptimizedSize = results.reduce((sum, r) => sum + r.optimizedSize, 0);
    const totalSavings = totalOriginalSize - totalOptimizedSize;
    const averageCompressionRatio = (totalSavings / totalOriginalSize) * 100;

    return {
      totalOriginalSize,
      totalOptimizedSize,
      totalSavings,
      averageCompressionRatio
    };
  }
}

export const imageOptimizer = ImageOptimizer.getInstance();

// Hook pour utiliser l'optimiseur d'images
export const useImageOptimizer = () => {
  return {
    optimizeImage: (file: File, context?: keyof typeof ImageOptimizer.prototype.configs) =>
      imageOptimizer.optimizeImage(file, context),
    optimizeImages: (files: File[], context?: keyof typeof ImageOptimizer.prototype.configs) =>
      imageOptimizer.optimizeImages(files, context),
    detectOptimalFormat: (file: File) => imageOptimizer.detectOptimalFormat(file),
    getOptimizationStats: (results: Array<{ originalSize: number; optimizedSize: number }>) =>
      imageOptimizer.getOptimizationStats(results)
  };
};
