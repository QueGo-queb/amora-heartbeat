import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "heart" | "spinner";
  className?: string;
}

export function Loader({ size = "md", variant = "default", className }: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  if (variant === "heart") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="heart-logo">
          <div className={cn("heart-shape animate-pulse", sizeClasses[size])} />
        </div>
      </div>
    );
  }

  if (variant === "spinner") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", sizeClasses[size])} />
    </div>
  );
}

// Overlay loader pour les actions globales
interface LoaderOverlayProps {
  isVisible: boolean;
  message?: string;
  variant?: "default" | "heart";
}

export function LoaderOverlay({ isVisible, message = "Chargement...", variant = "default" }: LoaderOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-card border shadow-lg">
        <Loader variant={variant} size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
