// Créez ce fichier : src/components/ui/TouchFeedback.tsx
import React from 'react';

interface TouchFeedbackProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

export const TouchFeedback = ({ children, onPress, className = "" }: TouchFeedbackProps) => (
  <div 
    className={`active:scale-95 transition-transform touch-manipulation ${className}`}
    onTouchStart={onPress}
  >
    {children}
  </div>
);
