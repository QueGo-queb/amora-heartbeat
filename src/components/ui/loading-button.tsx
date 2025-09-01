import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@/components/ui/button";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  loadingVariant?: "default" | "heart" | "spinner";
  children: React.ReactNode;
}

export function LoadingButton({ 
  loading = false, 
  loadingText, 
  loadingVariant = "spinner",
  children, 
  disabled,
  className,
  ...props 
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn("relative", className)}
      {...props}
    >
      {loading && (
        <Loader 
          variant={loadingVariant} 
          size="sm" 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" 
        />
      )}
      <span className={cn(loading && "opacity-0")}>
        {loading && loadingText ? loadingText : children}
      </span>
    </Button>
  );
}
