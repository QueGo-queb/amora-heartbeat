/**
 * ✅ COMPOSANT DE CHARGEMENT ULTRA-OPTIMISÉ
 */

import { memo } from 'react';
import { Loader2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'heart' | 'dots';
  className?: string;
  text?: string;
}

export const OptimizedLoader = memo<OptimizedLoaderProps>(({ 
  size = 'md', 
  variant = 'default',
  className,
  text 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const renderLoader = () => {
    switch (variant) {
      case 'heart':
        return (
          <Heart 
            className={cn(
              'animate-pulse text-red-500',
              sizeClasses[size],
              className
            )} 
          />
        );
      
      case 'dots':
        return (
          <div className={cn('flex space-x-1', className)}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'bg-current rounded-full animate-pulse',
                  size === 'sm' ? 'h-1 w-1' : size === 'md' ? 'h-2 w-2' : 'h-3 w-3'
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        );
      
      default:
        return (
          <Loader2 
            className={cn(
              'animate-spin',
              sizeClasses[size],
              className
            )} 
          />
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {renderLoader()}
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
});

OptimizedLoader.displayName = 'OptimizedLoader';
