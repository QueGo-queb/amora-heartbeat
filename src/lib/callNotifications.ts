/**
 * Service de notifications pour les appels
 * Gère les notifications push, sonores et visuelles
 */

export interface CallNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  vibrate?: number[];
  sound?: string;
}

export class CallNotificationService {
  private static instance: CallNotificationService;
  private notificationPermission: NotificationPermission = 'default';
  private ringtone: HTMLAudioElement | null = null;
  private vibrationPattern: number[] = [200, 100, 200, 100, 200];

  private constructor() {
    this.init();
  }

  public static getInstance(): CallNotificationService {
    if (!CallNotificationService.instance) {
      CallNotificationService.instance = new CallNotificationService();
    }
    return CallNotificationService.instance;
  }

  private async init(): Promise<void> {
    // Vérifier le support des notifications
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
    }

    // Initialiser la sonnerie
    this.setupRingtone();
  }

  /**
   * Demander la permission pour les notifications
   */
  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Ce navigateur ne supporte pas les notifications');
      return false;
    }

    if (this.notificationPermission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Erreur demande permission notifications:', error);
      return false;
    }
  }

  /**
   * Afficher une notification d'appel entrant
   */
  public async showIncomingCallNotification(
    callerName: string,
    callType: 'audio' | 'video',
    onAnswer?: () => void,
    onDecline?: () => void
  ): Promise<Notification | null> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return null;

    const options: CallNotificationOptions = {
      title: '📞 Appel entrant',
      body: `${callerName} vous appelle en ${callType === 'video' ? 'vidéo' : 'audio'}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'incoming-call',
      requireInteraction: true,
      actions: [
        {
          action: 'answer',
          title: '✅ Répondre',
          icon: '/icons/phone-accept.png'
        },
        {
          action: 'decline',
          title: '❌ Refuser',
          icon: '/icons/phone-decline.png'
        }
      ],
      vibrate: this.vibrationPattern,
    };

    try {
      const notification = new Notification(options.title, options);

      // Gérer les clics sur les actions
      notification.addEventListener('click', (event) => {
        const action = (event as any).action;
        
        switch (action) {
          case 'answer':
            onAnswer?.();
            break;
          case 'decline':
            onDecline?.();
            break;
          default:
            // Clic sur la notification elle-même
            window.focus();
            onAnswer?.();
        }
        
        notification.close();
      });

      // Auto-fermeture après 30 secondes
      setTimeout(() => {
        notification.close();
      }, 30000);

      return notification;
    } catch (error) {
      console.error('Erreur création notification:', error);
      return null;
    }
  }

  /**
   * Jouer la sonnerie d'appel
   */
  public playRingtone(): void {
    if (this.ringtone) {
      this.ringtone.currentTime = 0;
      this.ringtone.loop = true;
      this.ringtone.play().catch(error => {
        console.error('Erreur lecture sonnerie:', error);
      });
    }
  }

  /**
   * Arrêter la sonnerie
   */
  public stopRingtone(): void {
    if (this.ringtone) {
      this.ringtone.pause();
      this.ringtone.currentTime = 0;
      this.ringtone.loop = false;
    }
  }

  /**
   * Faire vibrer le dispositif (si supporté)
   */
  public vibrate(pattern?: number[]): boolean {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern || this.vibrationPattern);
      return true;
    }
    return false;
  }

  /**
   * Notification de fin d'appel
   */
  public async showCallEndedNotification(
    duration: number,
    callType: 'audio' | 'video'
  ): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const options: CallNotificationOptions = {
      title: '📞 Appel terminé',
      body: `Appel ${callType === 'video' ? 'vidéo' : 'audio'} terminé (${durationText})`,
      icon: '/icons/icon-192x192.png',
      tag: 'call-ended',
      requireInteraction: false,
    };

    try {
      const notification = new Notification(options.title, options);
      
      // Auto-fermeture après 5 secondes
      setTimeout(() => {
        notification.close();
      }, 5000);
    } catch (error) {
      console.error('Erreur notification fin appel:', error);
    }
  }

  /**
   * Notification d'appel manqué
   */
  public async showMissedCallNotification(
    callerName: string,
    callType: 'audio' | 'video',
    timestamp: Date
  ): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    const timeString = timestamp.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const options: CallNotificationOptions = {
      title: '📞 Appel manqué',
      body: `Appel ${callType === 'video' ? 'vidéo' : 'audio'} manqué de ${callerName} à ${timeString}`,
      icon: '/icons/icon-192x192.png',
      tag: 'missed-call',
      requireInteraction: false,
      actions: [
        {
          action: 'callback',
          title: '📞 Rappeler',
          icon: '/icons/phone-callback.png'
        }
      ]
    };

    try {
      const notification = new Notification(options.title, options);
      
      notification.addEventListener('click', (event) => {
        const action = (event as any).action;
        
        if (action === 'callback') {
          // Logique de rappel (à implémenter selon vos besoins)
          window.focus();
          // Rediriger vers la page de chat ou déclencher un appel
        }
        
        notification.close();
      });

      // Auto-fermeture après 10 secondes
      setTimeout(() => {
        notification.close();
      }, 10000);
    } catch (error) {
      console.error('Erreur notification appel manqué:', error);
    }
  }

  /**
   * Configuration de la sonnerie
   */
  private setupRingtone(): void {
    try {
      this.ringtone = new Audio();
      
      // Essayer plusieurs formats de sonnerie
      const formats = ['mp3', 'ogg', 'wav'];
      let formatIndex = 0;
      
      const tryNextFormat = () => {
        if (formatIndex < formats.length) {
          this.ringtone!.src = `/sounds/ringtone.${formats[formatIndex]}`;
          formatIndex++;
        } else {
          // Fallback: générer une sonnerie synthétique
          this.generateSyntheticRingtone();
        }
      };

      this.ringtone.addEventListener('error', tryNextFormat);
      this.ringtone.addEventListener('canplaythrough', () => {
        console.log('Sonnerie chargée:', this.ringtone!.src);
      });

      // Commencer avec le premier format
      tryNextFormat();
      
      // Configuration audio
      this.ringtone.volume = 0.7;
      this.ringtone.preload = 'auto';
    } catch (error) {
      console.error('Erreur setup sonnerie:', error);
    }
  }

  /**
   * Générer une sonnerie synthétique si aucun fichier n'est disponible
   */
  private generateSyntheticRingtone(): void {
    try {
      if ('AudioContext' in window) {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.9);
        
        // Créer un pattern de sonnerie
        this.ringtone = {
          play: () => {
            oscillator.start();
            setTimeout(() => oscillator.stop(), 1000);
          },
          pause: () => oscillator.stop(),
          currentTime: 0,
          loop: false
        } as any;
      }
    } catch (error) {
      console.error('Erreur génération sonnerie synthétique:', error);
    }
  }

  /**
   * Vérifier le support des notifications
   */
  public isNotificationSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Obtenir le statut des permissions
   */
  public getPermissionStatus(): NotificationPermission {
    return this.notificationPermission;
  }
}

// Export du singleton
export const callNotificationService = CallNotificationService.getInstance();
