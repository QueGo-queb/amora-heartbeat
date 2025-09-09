/**
 * Service WebRTC pour la gestion des appels audio/vidéo
 * Gère la signalisation, les connexions peer-to-peer et la qualité
 */

export interface RTCConnectionConfig {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize?: number;
}

export interface CallQuality {
  score: number; // 0-100
  rating: 'excellent' | 'good' | 'poor' | 'unknown';
  metrics: {
    bitrate?: number;
    packetsLost?: number;
    rtt?: number; // Round Trip Time
    jitter?: number;
  };
}

export interface MediaConstraintsConfig {
  audio: boolean | MediaTrackConstraints;
  video: boolean | MediaTrackConstraints;
}

export class WebRTCService {
  private static instance: WebRTCService;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private dataChannel: RTCDataChannel | null = null;
  
  // Configuration par défaut
  private defaultConfig: RTCConnectionConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
  };

  private qualityMetrics: CallQuality = {
    score: 0,
    rating: 'unknown',
    metrics: {}
  };

  // Callbacks
  private onLocalStreamCallback?: (stream: MediaStream) => void;
  private onRemoteStreamCallback?: (stream: MediaStream) => void;
  private onIceCandidateCallback?: (candidate: RTCIceCandidate) => void;
  private onConnectionStateChangeCallback?: (state: RTCPeerConnectionState) => void;
  private onQualityChangeCallback?: (quality: CallQuality) => void;

  private constructor() {
    this.setupQualityMonitoring();
  }

  public static getInstance(): WebRTCService {
    if (!WebRTCService.instance) {
      WebRTCService.instance = new WebRTCService();
    }
    return WebRTCService.instance;
  }

  /**
   * Initialiser une nouvelle connexion WebRTC
   */
  public async initializeConnection(config?: Partial<RTCConnectionConfig>): Promise<void> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    this.peerConnection = new RTCPeerConnection(finalConfig);
    
    // Configuration des événements
    this.setupPeerConnectionEvents();
    
    // Créer un data channel pour les métadonnées
    this.dataChannel = this.peerConnection.createDataChannel('metadata', {
      ordered: true
    });
    
    this.setupDataChannelEvents();
  }

  /**
   * Obtenir les médias utilisateur (audio/vidéo)
   */
  public async getUserMedia(constraints: MediaConstraintsConfig): Promise<MediaStream> {
    try {
      // Contraintes optimisées selon le type d'appel
      const enhancedConstraints: MediaStreamConstraints = {
        audio: constraints.audio === true ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        } : constraints.audio,
        video: constraints.video === true ? {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user',
        } : constraints.video,
      };

      const stream = await navigator.mediaDevices.getUserMedia(enhancedConstraints);
      this.localStream = stream;
      
      // Ajouter les tracks à la connexion peer
      if (this.peerConnection) {
        stream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, stream);
        });
      }
      
      this.onLocalStreamCallback?.(stream);
      return stream;
    } catch (error) {
      console.error('Erreur getUserMedia:', error);
      throw new Error(`Impossible d'accéder aux médias: ${error}`);
    }
  }

  /**
   * Créer une offre SDP
   */
  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Connexion peer non initialisée');
    }

    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  /**
   * Créer une réponse SDP
   */
  public async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Connexion peer non initialisée');
    }

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  /**
   * Définir la description distante
   */
  public async setRemoteDescription(sdp: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Connexion peer non initialisée');
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  /**
   * Ajouter un candidat ICE
   */
  public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Connexion peer non initialisée');
    }

    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  /**
   * Contrôler l'audio local
   */
  public toggleAudio(enabled?: boolean): boolean {
    if (!this.localStream) return false;
    
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = enabled !== undefined ? enabled : !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }

  /**
   * Contrôler la vidéo locale
   */
  public toggleVideo(enabled?: boolean): boolean {
    if (!this.localStream) return false;
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = enabled !== undefined ? enabled : !videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  }

  /**
   * Changer la qualité vidéo
   */
  public async changeVideoQuality(quality: 'low' | 'medium' | 'high'): Promise<void> {
    if (!this.localStream) return;
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (!videoTrack) return;

    const constraints = this.getVideoConstraintsForQuality(quality);
    
    try {
      await videoTrack.applyConstraints(constraints);
    } catch (error) {
      console.error('Erreur changement qualité vidéo:', error);
    }
  }

  /**
   * Obtenir les statistiques de connexion
   */
  public async getConnectionStats(): Promise<CallQuality> {
    if (!this.peerConnection) {
      return this.qualityMetrics;
    }

    try {
      const stats = await this.peerConnection.getStats();
      let bitrate = 0;
      let packetsLost = 0;
      let rtt = 0;
      let jitter = 0;

      stats.forEach((report) => {
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          bitrate += report.bytesReceived * 8 / report.timestamp * 1000;
          packetsLost += report.packetsLost || 0;
        }
        
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          rtt = report.currentRoundTripTime * 1000; // en ms
        }
        
        if (report.type === 'inbound-rtp') {
          jitter += report.jitter || 0;
        }
      });

      this.qualityMetrics = {
        score: this.calculateQualityScore(bitrate, packetsLost, rtt, jitter),
        rating: this.getQualityRating(bitrate, packetsLost, rtt),
        metrics: { bitrate, packetsLost, rtt, jitter }
      };

      return this.qualityMetrics;
    } catch (error) {
      console.error('Erreur statistiques:', error);
      return this.qualityMetrics;
    }
  }

  /**
   * Fermer la connexion et nettoyer les ressources
   */
  public close(): void {
    // Fermer les streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }
    
    // Fermer la data channel
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    
    // Fermer la connexion peer
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    // Réinitialiser les métriques
    this.qualityMetrics = {
      score: 0,
      rating: 'unknown',
      metrics: {}
    };
  }

  /**
   * Configuration des événements de la connexion peer
   */
  private setupPeerConnectionEvents(): void {
    if (!this.peerConnection) return;

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.onIceCandidateCallback?.(event.candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.onRemoteStreamCallback?.(this.remoteStream);
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection!.connectionState;
      this.onConnectionStateChangeCallback?.(state);
      
      if (state === 'failed' || state === 'disconnected') {
        console.warn('Connexion WebRTC dégradée:', state);
      }
    };

    this.peerConnection.ondatachannel = (event) => {
      const channel = event.channel;
      this.setupDataChannelEvents(channel);
    };
  }

  /**
   * Configuration des événements du data channel
   */
  private setupDataChannelEvents(channel?: RTCDataChannel): void {
    const dataChannel = channel || this.dataChannel;
    if (!dataChannel) return;

    dataChannel.onopen = () => {
      console.log('Data channel ouvert');
    };

    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Traiter les métadonnées reçues
        console.log('Métadonnées reçues:', data);
      } catch (error) {
        console.error('Erreur parsing métadonnées:', error);
      }
    };

    dataChannel.onerror = (error) => {
      console.error('Erreur data channel:', error);
    };
  }

  /**
   * Monitoring de la qualité en temps réel
   */
  private setupQualityMonitoring(): void {
    setInterval(async () => {
      if (this.peerConnection?.connectionState === 'connected') {
        const quality = await this.getConnectionStats();
        this.onQualityChangeCallback?.(quality);
      }
    }, 5000); // Vérifier toutes les 5 secondes
  }

  /**
   * Contraintes vidéo selon la qualité
   */
  private getVideoConstraintsForQuality(quality: 'low' | 'medium' | 'high'): MediaTrackConstraints {
    switch (quality) {
      case 'low':
        return {
          width: { ideal: 640, max: 854 },
          height: { ideal: 360, max: 480 },
          frameRate: { ideal: 15, max: 24 }
        };
      case 'medium':
        return {
          width: { ideal: 1280, max: 1280 },
          height: { ideal: 720, max: 720 },
          frameRate: { ideal: 24, max: 30 }
        };
      case 'high':
        return {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        };
      default:
        return {};
    }
  }

  /**
   * Calculer le score de qualité (0-100)
   */
  private calculateQualityScore(bitrate: number, packetsLost: number, rtt: number, jitter: number): number {
    let score = 100;
    
    // Pénalités selon les métriques
    if (bitrate < 500000) score -= 30; // < 500kbps
    if (packetsLost > 5) score -= 20;
    if (rtt > 200) score -= 25; // > 200ms
    if (jitter > 50) score -= 15;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Déterminer la qualité textuelle
   */
  private getQualityRating(bitrate: number, packetsLost: number, rtt: number): CallQuality['rating'] {
    if (bitrate > 1000000 && packetsLost < 2 && rtt < 100) return 'excellent';
    if (bitrate > 500000 && packetsLost < 5 && rtt < 200) return 'good';
    if (bitrate > 0) return 'poor';
    return 'unknown';
  }

  // Setters pour les callbacks
  public onLocalStream(callback: (stream: MediaStream) => void): void {
    this.onLocalStreamCallback = callback;
  }

  public onRemoteStream(callback: (stream: MediaStream) => void): void {
    this.onRemoteStreamCallback = callback;
  }

  public onIceCandidate(callback: (candidate: RTCIceCandidate) => void): void {
    this.onIceCandidateCallback = callback;
  }

  public onConnectionStateChange(callback: (state: RTCPeerConnectionState) => void): void {
    this.onConnectionStateChangeCallback = callback;
  }

  public onQualityChange(callback: (quality: CallQuality) => void): void {
    this.onQualityChangeCallback = callback;
  }

  // Getters
  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  public getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }

  public getCurrentQuality(): CallQuality {
    return this.qualityMetrics;
  }
}

// Export du singleton
export const webRTCService = WebRTCService.getInstance();
