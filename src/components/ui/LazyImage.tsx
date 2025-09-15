import { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  [key: string]: any;
}

export const LazyImage = ({ src, alt, className, ...props }: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <img 
      src={loaded ? src : '/placeholder.svg'} 
      alt={alt}
      className={className}
      onLoad={() => setLoaded(true)}
      {...props} 
    />
  );
};
