import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { trackEvent, trackError } from '@/lib/sentry';

export interface CallSession {
  id: string;
  caller_id: string;
  receiver_id: string;
  call_type: 'audio' | 'video';
  status: 'initiating' | 'ringing' | 'connecting' | 'active' | 'ended' | 'cancelled' | 'failed' | 'rejected';
  duration_seconds: number;
  created_at: string;
  started_at?: string;
  ended_at?: string;
}

export interface CallPreferences {
  user_id: string;
  allow_calls_from: 'everyone' | 'matches' | 'premium' | 'none';
  auto_answer: boolean;
  call_notifications: boolean;
  video_quality: 'low' | 'medium' | 'high' | 'auto';
  available_for_calls: boolean;
}

interface UseCallReturn {
  // État des appels
  currentCall: CallSession | null;
  incomingCall: CallSession | null;
  callHistory: CallSession[];
  preferences: CallPreferences | null;
  loading: boolean;
  
  // Actions d'appel
  initiateCall: (receiverId: string, callType: 'audio' | 'video') => Promise<boolean>;
  answerCall: (callId: string) => Promise<boolean>;
  rejectCall: (callId: string) => Promise<boolean>;
  endCall: (callId: string) => Promise<boolean>;
  
  // Gestion des préférences
  updatePreferences: (preferences: Partial<CallPreferences>) => Promise<boolean>;
  checkCallPermission: (receiverId: string) => Promise<boolean>;
  
  // WebRTC
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
}

export const useCall = (): UseCallReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // États principaux
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const [callHistory, setCallHistory] = useState<CallSession[]>([]);
  const [preferences, setPreferences] = useState<CallPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  
  // États WebRTC
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  
  // Références WebRTC
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const realtimeChannel = useRef<any>(null);

  // Configuration WebRTC
  const rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Charger les préférences au démarrage
  useEffect(() => {
    if (user?.id) {
      loadCallPreferences();
      loadCallHistory();
      setupRealtimeSubscription();
    }
    
    return () => {
      cleanupCall();
    };
  }, [user?.id]);

  const loadCallPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('call_preferences')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Créer les préférences par défaut
        const { data: newPrefs, error: createError } = await supabase
          .from('call_preferences')
          .insert([{ user_id: user!.id }])
          .select()
          .single();

        if (createError) throw createError;
        setPreferences(newPrefs);
      }
    } catch (error) {
      console.error('Erreur chargement préférences:', error);
      trackError(error as Error, { context: 'useCall.loadCallPreferences' });
    }
  };

  const loadCallHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('call_sessions')
        .select('*')
        .or(`caller_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCallHistory(data || []);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      trackError(error as Error, { context: 'useCall.loadCallHistory' });
    }
  };

  const setupRealtimeSubscription = () => {
    // Écouter les appels entrants
    realtimeChannel.current = supabase
      .channel('call-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_sessions',
          filter: `receiver_id=eq.${user!.id}`,
        },
        handleIncomingCall
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_sessions',
          filter: `caller_id=eq.${user!.id},receiver_id=eq.${user!.id}`,
        },
        handleCallUpdate
      )
      .subscribe();
  };

  const handleIncomingCall = (payload: any) => {
    const newCall = payload.new as CallSession;
    
    if (newCall.receiver_id === user!.id && newCall.status === 'ringing') {
      setIncomingCall(newCall);
      
      // Notification sonore/visuelle
      toast({
        title: '📞 Appel entrant',
        description: `Appel ${newCall.call_type === 'video' ? 'vidéo' : 'audio'} entrant`,
        duration: 30000, // 30 secondes
      });

      trackEvent('call_received', {
        category: 'call',
        action: 'incoming',
        callType: newCall.call_type,
      });
    }
  };

  const handleCallUpdate = (payload: any) => {
    const updatedCall = payload.new as CallSession;
    
    if (currentCall?.id === updatedCall.id) {
      setCurrentCall(updatedCall);
      
      if (updatedCall.status === 'ended') {
        cleanupCall();
      }
    }
    
    if (incomingCall?.id === updatedCall.id) {
      if (updatedCall.status === 'cancelled' || updatedCall.status === 'ended') {
        setIncomingCall(null);
      }
    }
  };

  const initiateCall = useCallback(async (receiverId: string, callType: 'audio' | 'video'): Promise<boolean> => {
    if (!user?.id) return false;
    
    setLoading(true);
    
    try {
      // Vérifier les permissions d'appel
      const canCall = await checkCallPermission(receiverId);
      if (!canCall) {
        toast({
          title: 'Appel non autorisé',
          description: 'Cette personne ne reçoit pas d\'appels pour le moment.',
          variant: 'destructive',
        });
        return false;
      }

      // Créer la session d'appel
      const { data: callSession, error } = await supabase
        .from('call_sessions')
        .insert([{
          caller_id: user.id,
          receiver_id: receiverId,
          call_type: callType,
          status: 'ringing',
        }])
        .select()
        .single();

      if (error) throw error;

      setCurrentCall(callSession);
      
      // Initialiser WebRTC
      await initializeWebRTC(callSession.id, true);

      // Mettre à jour le statut
      await updateCallStatus(callSession.id, 'connecting');

      trackEvent('call_initiated', {
        category: 'call',
        action: 'outgoing',
        callType,
      });

      return true;
    } catch (error) {
      console.error('Erreur initiation appel:', error);
      trackError(error as Error, { context: 'useCall.initiateCall' });
      
      toast({
        title: 'Erreur d\'appel',
        description: 'Impossible d\'initier l\'appel.',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  const answerCall = useCallback(async (callId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      // Mettre à jour le statut
      await updateCallStatus(callId, 'connecting');
      
      setCurrentCall(incomingCall);
      setIncomingCall(null);
      
      // Initialiser WebRTC en tant que receiver
      await initializeWebRTC(callId, false);
      
      await updateCallStatus(callId, 'active');

      trackEvent('call_answered', {
        category: 'call',
        action: 'answer',
      });

      return true;
    } catch (error) {
      console.error('Erreur réponse appel:', error);
      trackError(error as Error, { context: 'useCall.answerCall' });
      return false;
    }
  }, [user?.id, incomingCall]);

  const rejectCall = useCallback(async (callId: string): Promise<boolean> => {
    try {
      await updateCallStatus(callId, 'rejected');
      setIncomingCall(null);

      trackEvent('call_rejected', {
        category: 'call',
        action: 'reject',
      });

      return true;
    } catch (error) {
      console.error('Erreur rejet appel:', error);
      return false;
    }
  }, []);

  const endCall = useCallback(async (callId: string): Promise<boolean> => {
    try {
      await updateCallStatus(callId, 'ended');
      cleanupCall();

      trackEvent('call_ended', {
        category: 'call',
        action: 'end',
      });

      return true;
    } catch (error) {
      console.error('Erreur fin appel:', error);
      return false;
    }
  }, []);

  const updateCallStatus = async (callId: string, status: CallSession['status']) => {
    const updateData: any = { status };
    
    if (status === 'active' && !currentCall?.started_at) {
      updateData.started_at = new Date().toISOString();
    }
    
    if (status === 'ended') {
      updateData.ended_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('call_sessions')
      .update(updateData)
      .eq('id', callId);

    if (error) throw error;
  };

  const initializeWebRTC = async (callId: string, isCaller: boolean) => {
    try {
      // Obtenir les médias utilisateur
      const constraints = currentCall?.call_type === 'video' 
        ? { video: true, audio: true }
        : { video: false, audio: true };
        
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      // Créer la connexion peer
      peerConnection.current = new RTCPeerConnection(rtcConfiguration);

      // Ajouter le stream local
      stream.getTracks().forEach(track => {
        peerConnection.current!.addTrack(track, stream);
      });

      // Gérer le stream distant
      peerConnection.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      // Gérer les candidats ICE
      peerConnection.current.onicecandidate = async (event) => {
        if (event.candidate) {
          await supabase
            .from('call_sessions')
            .update({
              ice_candidates: supabase.rpc('array_append', {
                arr: currentCall?.id || callId,
                element: event.candidate
              })
            })
            .eq('id', callId);
        }
      };

      if (isCaller) {
        // Créer l'offre
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        // Sauvegarder l'offre
        await supabase
          .from('call_sessions')
          .update({ caller_sdp: offer })
          .eq('id', callId);
      }

    } catch (error) {
      console.error('Erreur WebRTC:', error);
      throw error;
    }
  };

  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    setCurrentCall(null);
    setRemoteStream(null);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  const updatePreferences = useCallback(async (newPreferences: Partial<CallPreferences>): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const { data, error } = await supabase
        .from('call_preferences')
        .upsert([{ user_id: user.id, ...newPreferences }])
        .select()
        .single();

      if (error) throw error;
      
      setPreferences(data);
      return true;
    } catch (error) {
      console.error('Erreur mise à jour préférences:', error);
      return false;
    }
  }, [user?.id]);

  const checkCallPermission = useCallback(async (receiverId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('can_user_call', {
          caller_uuid: user.id,
          receiver_uuid: receiverId
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Erreur vérification permission:', error);
      return false;
    }
  }, [user?.id]);

  return {
    // État des appels
    currentCall,
    incomingCall,
    callHistory,
    preferences,
    loading,
    
    // Actions d'appel
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    
    // Gestion des préférences
    updatePreferences,
    checkCallPermission,
    
    // WebRTC
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoMuted,
    toggleAudio,
    toggleVideo,
  };
};
