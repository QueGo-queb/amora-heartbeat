/**
 * Types TypeScript pour le système d'appels
 * Définit les interfaces et types pour WebRTC et les appels
 */

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
    last_activity_at: string;
    
    // Données WebRTC (temporaires)
    caller_sdp?: RTCSessionDescriptionInit;
    receiver_sdp?: RTCSessionDescriptionInit;
    ice_candidates?: RTCIceCandidateInit[];
    
    // Métadonnées
    connection_quality?: 'excellent' | 'good' | 'poor' | 'unknown';
  }
  
  export interface CallParticipant {
    id: string;
    call_session_id: string;
    user_id: string;
    status: 'invited' | 'joined' | 'left' | 'kicked';
    role: 'caller' | 'receiver' | 'participant';
    joined_at?: string;
    left_at?: string;
    connection_info: Record<string, any>;
  }
  
  export interface CallLog {
    id: string;
    call_session_id: string;
    user_id: string;
    action: 'call_initiated' | 'call_answered' | 'call_rejected' | 'call_ended' | 'connection_failed' | 'quality_degraded';
    details: Record<string, any>;
    created_at: string;
  }
  
  export interface CallPreferences {
    user_id: string;
    allow_calls_from: 'everyone' | 'matches' | 'premium' | 'none';
    auto_answer: boolean;
    call_notifications: boolean;
    video_quality: 'low' | 'medium' | 'high' | 'auto';
    audio_echo_cancellation: boolean;
    available_for_calls: boolean;
    available_hours_start: string; // Format HH:MM:SS
    available_hours_end: string;   // Format HH:MM:SS
    timezone: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface CallQuality {
    score: number; // 0-100
    rating: 'excellent' | 'good' | 'poor' | 'unknown';
    metrics: {
      bitrate?: number;
      packetsLost?: number;
      rtt?: number; // Round Trip Time en ms
      jitter?: number;
      frameRate?: number;
      resolution?: string;
    };
  }
  
  export interface MediaDeviceInfo {
    deviceId: string;
    kind: 'audioinput' | 'audiooutput' | 'videoinput';
    label: string;
    groupId: string;
  }
  
  export interface CallStats {
    session_id: string;
    duration: number;
    quality_average: number;
    connection_time: number;
    disconnections: number;
    bytes_sent: number;
    bytes_received: number;
    created_at: string;
  }
  
  // Types pour les événements d'appel
  export type CallEventType = 
    | 'call_initiated'
    | 'call_ringing'
    | 'call_answered'
    | 'call_rejected'
    | 'call_ended'
    | 'call_failed'
    | 'connection_established'
    | 'connection_lost'
    | 'quality_changed'
    | 'media_changed';
  
  export interface CallEvent {
    type: CallEventType;
    session_id: string;
    timestamp: string;
    data?: Record<string, any>;
  }
  
  // Types pour les contraintes média
  export interface MediaConstraintsPreset {
    name: string;
    audio: boolean | MediaTrackConstraints;
    video: boolean | MediaTrackConstraints;
    description: string;
  }
  
  export const MEDIA_PRESETS: Record<string, MediaConstraintsPreset> = {
    AUDIO_ONLY: {
      name: 'Audio uniquement',
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
      },
      video: false,
      description: 'Appel audio de haute qualité'
    },
    VIDEO_LOW: {
      name: 'Vidéo basse qualité',
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: {
        width: { ideal: 640, max: 854 },
        height: { ideal: 360, max: 480 },
        frameRate: { ideal: 15, max: 24 }
      },
      description: 'Vidéo 480p, idéal pour connexions lentes'
    },
    VIDEO_MEDIUM: {
      name: 'Vidéo qualité moyenne',
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: {
        width: { ideal: 1280, max: 1280 },
        height: { ideal: 720, max: 720 },
        frameRate: { ideal: 24, max: 30 }
      },
      description: 'Vidéo 720p, bon compromis qualité/bande passante'
    },
    VIDEO_HIGH: {
      name: 'Vidéo haute qualité',
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: {
        width: { ideal: 1920, max: 1920 },
        height: { ideal: 1080, max: 1080 },
        frameRate: { ideal: 30, max: 60 }
      },
      description: 'Vidéo 1080p, nécessite une bonne connexion'
    }
  };
  
  // Types pour les erreurs d'appel
  export type CallErrorType = 
    | 'permission_denied'
    | 'user_media_error'
    | 'connection_failed'
    | 'peer_connection_failed'
    | 'signaling_error'
    | 'network_error'
    | 'timeout'
    | 'user_not_available'
    | 'user_busy'
    | 'unknown_error';
  
  export interface CallError {
    type: CallErrorType;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
  }
  
  // Utilitaires de validation
  export const isValidCallSession = (session: any): session is CallSession => {
    return (
      typeof session === 'object' &&
      typeof session.id === 'string' &&
      typeof session.caller_id === 'string' &&
      typeof session.receiver_id === 'string' &&
      ['audio', 'video'].includes(session.call_type) &&
      ['initiating', 'ringing', 'connecting', 'active', 'ended', 'cancelled', 'failed', 'rejected'].includes(session.status)
    );
  };
  
  export const getCallDuration = (session: CallSession): number => {
    if (!session.started_at || !session.ended_at) {
      return session.duration_seconds || 0;
    }
    
    const start = new Date(session.started_at).getTime();
    const end = new Date(session.ended_at).getTime();
    return Math.floor((end - start) / 1000);
  };
  
  export const formatCallDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };