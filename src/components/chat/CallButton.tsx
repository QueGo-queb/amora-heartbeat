import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Phone, Video, PhoneOff, Loader2 } from 'lucide-react';
import { useCall } from '@/hooks/useCall';
import { cn } from '@/lib/utils';

interface CallButtonProps {
  userId: string;
  userName?: string;
  callType?: 'audio' | 'video';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  onCallInitiated?: () => void;
}

export const CallButton: React.FC<CallButtonProps> = ({
  userId,
  userName = 'cette personne',
  callType = 'audio',
  variant = 'default',
  size = 'md',
  disabled = false,
  className,
  onCallInitiated
}) => {
  const { 
    initiateCall, 
    currentCall, 
    loading, 
    checkCallPermission 
  } = useCall();

  const [checking, setChecking] = React.useState(false);
  const [canCall, setCanCall] = React.useState<boolean | null>(null);
  const [userPlan, setUserPlan] = React.useState<string | null>(null);

  // Vérifier le plan de l'utilisateur connecté
  React.useEffect(() => {
    const checkUserPlan = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .single();
          
          setUserPlan(profile?.plan || 'free');
        }
      } catch (error) {
        console.error('Erreur vérification plan:', error);
        setUserPlan('free');
      }
    };

    checkUserPlan();
  }, []);

  // Vérifier les permissions au montage
  React.useEffect(() => {
    const checkPermissions = async () => {
      setChecking(true);
      const permission = await checkCallPermission(userId);
      setCanCall(permission);
      setChecking(false);
    };

    if (userPlan) {
      checkPermissions();
    }
  }, [userId, checkCallPermission, userPlan]);

  const handleCall = async () => {
    if (!canCall || currentCall || loading) return;

    try {
      const success = await initiateCall(userId, callType);
      if (success) {
        onCallInitiated?.();
      }
    } catch (error) {
      console.error('Erreur initiation appel:', error);
    }
  };

  const isDisabled = disabled || loading || checking || !canCall || !!currentCall || userPlan !== 'premium';

  const getButtonIcon = () => {
    if (loading || checking) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (currentCall) {
      return <PhoneOff className="h-4 w-4" />;
    }
    
    return callType === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />;
  };

  const getButtonText = () => {
    if (checking) return 'Vérification...';
    if (loading) return 'Appel en cours...';
    if (currentCall) return 'En appel';
    if (userPlan !== 'premium') return '👑 Premium requis';
    if (!canCall) return 'Appel non autorisé';
    
    return callType === 'video' ? 'Appel vidéo' : 'Appel audio';
  };

  const getTooltipText = () => {
    if (userPlan !== 'premium') {
      return 'Mettez à niveau vers Premium pour passer des appels';
    }
    
    if (!canCall) {
      return `${userName} ne reçoit pas d'appels pour le moment`;
    }
    
    if (currentCall) {
      return 'Vous êtes déjà en appel';
    }
    
    return `Appeler ${userName} en ${callType === 'video' ? 'vidéo' : 'audio'}`;
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size="icon"
            disabled={isDisabled}
            onClick={handleCall}
            className={cn(
              sizeClasses[size],
              'transition-all duration-200',
              {
                'bg-green-600 hover:bg-green-700': callType === 'audio' && !isDisabled && userPlan === 'premium',
                'bg-blue-600 hover:bg-blue-700': callType === 'video' && !isDisabled && userPlan === 'premium',
                'bg-gray-400 cursor-not-allowed': isDisabled,
                'bg-orange-500 hover:bg-orange-600': userPlan !== 'premium', // Style premium requis
              },
              className
            )}
          >
            {userPlan !== 'premium' ? (
              <span className="text-xs">👑</span>
            ) : (
              getButtonIcon()
            )}
            {size === 'lg' && (
              <span className="ml-2 hidden sm:inline">
                {getButtonText()}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Composant combiné pour audio ET vidéo
interface CallButtonGroupProps {
  userId: string;
  userName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  onCallInitiated?: (callType: 'audio' | 'video') => void;
}

export const CallButtonGroup: React.FC<CallButtonGroupProps> = ({
  userId,
  userName,
  variant = 'outline',
  size = 'sm',
  disabled = false,
  className,
  onCallInitiated
}) => {
  return (
    <div className={cn('flex space-x-2', className)}>
      <CallButton
        userId={userId}
        userName={userName}
        callType="audio"
        variant={variant}
        size={size}
        disabled={disabled}
        onCallInitiated={() => onCallInitiated?.('audio')}
      />
      <CallButton
        userId={userId}
        userName={userName}
        callType="video"
        variant={variant}
        size={size}
        disabled={disabled}
        onCallInitiated={() => onCallInitiated?.('video')}
      />
    </div>
  );
};
