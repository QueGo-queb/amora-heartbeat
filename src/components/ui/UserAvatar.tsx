// src/components/ui/UserAvatar.tsx
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallbackInitials?: string;
  className?: string;
}

export function UserAvatar({ 
  src, 
  alt = 'Avatar', 
  size = 'md', 
  fallbackInitials,
  className = '' 
}: UserAvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const iconSizes = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {src && (
        <AvatarImage 
          src={src} 
          alt={alt}
          onError={(e) => {
            console.error('Failed to load avatar image:', src);
          }}
        />
      )}
      <AvatarFallback className={`${textSizeClasses[size]} bg-gray-200 text-gray-600`}>
        {fallbackInitials ? (
          fallbackInitials.substring(0, 2).toUpperCase()
        ) : (
          <User size={iconSizes[size]} />
        )}
      </AvatarFallback>
    </Avatar>
  );
}