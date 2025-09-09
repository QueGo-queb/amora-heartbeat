import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Settings,
  Maximize,
  Minimize
} from 'lucide-react';
import { useCall } from '@/hooks/useCall';
import { cn } from '@/lib/utils';

interface CallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CallModal: React.FC<CallModalProps> = ({ open, onOpenChange }) => {
  const {
    currentCall,
    incomingCall,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoMuted,
    answerCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [callDuration, setCallDuration] = React.useState(0);

  const activeCall = currentCall || incomingCall;
  const isIncomingCall = !!incomingCall && !currentCall;
  const isVideoCall = activeCall?.call_type === 'video';

  // Gestion des streams vidéo
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Compteur de durée d'appel
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentCall?.status === 'active' && currentCall.started_at) {
      interval = setInterval(() => {
        const start = new Date(currentCall.started_at!).getTime();
        const now = new Date().getTime();
        setCallDuration(Math.floor((now - start) / 1000));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentCall?.status, currentCall?.started_at]);

  // Fermer le modal quand l'appel se termine
  useEffect(() => {
    if (!activeCall || activeCall.status === 'ended') {
      onOpenChange(false);
      setCallDuration(0);
    }
  }, [activeCall, onOpenChange]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (!activeCall) return '';
    
    switch (activeCall.status) {
      case 'initiating':
        return 'Initialisation...';
      case 'ringing':
        return isIncomingCall ? 'Appel entrant' : 'Sonnerie...';
      case 'connecting':
        return 'Connexion...';
      case 'active':
        return formatDuration(callDuration);
      default:
        return activeCall.status;
    }
  };

  const getStatusColor = () => {
    if (!activeCall) return 'secondary';
    
    switch (activeCall.status) {
      case 'active':
        return 'default';
      case 'connecting':
        return 'secondary';
      case 'ringing':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleAnswer = async () => {
    if (incomingCall) {
      await answerCall(incomingCall.id);
    }
  };

  const handleReject = async () => {
    if (incomingCall) {
      await rejectCall(incomingCall.id);
    }
  };

  const handleEndCall = async () => {
    if (activeCall) {
      await endCall(activeCall.id);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!activeCall) return null;

  const otherUserId = activeCall.caller_id === activeCall.receiver_id 
    ? activeCall.receiver_id 
    : activeCall.caller_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          'max-w-4xl p-0 bg-gray-900 border-gray-700',
          isFullscreen && 'w-screen h-screen max-w-none'
        )}
        hideCloseButton
      >
        <div className="relative h-full min-h-[600px] flex flex-col">
          {/* Header avec infos d'appel */}
          <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {otherUserId.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Utilisateur</p>
                <Badge variant={getStatusColor() as any} className="text-xs">
                  {getStatusText()}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-gray-700"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Zone vidéo principale */}
          {isVideoCall && (
            <div className="flex-1 relative bg-black">
              {/* Vidéo distante (principal) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Vidéo locale (miniature) */}
              <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Overlay si vidéo désactivée */}
              {isVideoMuted && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <VideoOff className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg opacity-75">Vidéo désactivée</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Zone audio uniquement */}
          {!isVideoCall && (
            <div className="flex-1 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
              <div className="text-center text-white">
                <Avatar className="h-32 w-32 mx-auto mb-6">
                  <AvatarFallback className="text-4xl">
                    {otherUserId.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-semibold mb-2">Appel audio</h2>
                <p className="text-lg opacity-75">{getStatusText()}</p>
              </div>
            </div>
          )}

          {/* Contrôles d'appel */}
          <div className="p-6 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center justify-center space-x-4">
              {isIncomingCall ? (
                // Contrôles pour appel entrant
                <>
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleReject}
                    className="rounded-full h-14 w-14"
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="default"
                    size="lg"
                    onClick={handleAnswer}
                    className="rounded-full h-14 w-14 bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="h-6 w-6" />
                  </Button>
                </>
              ) : (
                // Contrôles pendant l'appel
                <>
                  <Button
                    variant={isAudioMuted ? "destructive" : "secondary"}
                    size="lg"
                    onClick={toggleAudio}
                    className="rounded-full h-12 w-12"
                  >
                    {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  
                  {isVideoCall && (
                    <Button
                      variant={isVideoMuted ? "destructive" : "secondary"}
                      size="lg"
                      onClick={toggleVideo}
                      className="rounded-full h-12 w-12"
                    >
                      {isVideoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </Button>
                  )}
                  
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleEndCall}
                    className="rounded-full h-14 w-14"
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
