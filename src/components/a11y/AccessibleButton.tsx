import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useA11y } from '@/hooks/useA11y';

interface AccessibleButtonProps extends ButtonProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  announce?: string;
  announceOnClick?: boolean;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ children, onClick, announce, announceOnClick = false, ...props }, ref) => {
    const { announce: announceToScreenReader } = useA11y();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(event);
      }

      if (announceOnClick && announce) {
        announceToScreenReader(announce);
      }
    };

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';
