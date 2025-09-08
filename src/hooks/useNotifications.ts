import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  type?: 'message' | 'match' | 'like' | 'premium' | 'general';
  data?: any;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier le support des notifications
    const checkSupport = () => {
      const supported = 'Notification' in window && 
                       'serviceWorker' in navigator && 
                       'PushManager' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
        getExistingSubscription();
      }
    };

    checkSupport();
  }, []);

  // Récupérer l'abonnement existant
  const getExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      setSubscription(existingSubscription);
    } catch (error) {
      console.error('Erreur récupération abonnement:', error);
    }
  };

  // Demander la permission pour les notifications
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: "Non supporté",
        description: "Les notifications ne sont pas supportées sur ce navigateur",
        variant: "destructive",
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        toast({
          title: "✅ Notifications activées",
          description: "Vous recevrez maintenant les notifications AMORA",
        });
        return true;
      } else if (permission === 'denied') {
        toast({
          title: "Notifications refusées",
          description: "Vous pouvez les réactiver dans les paramètres du navigateur",
          variant: "destructive",
        });
      }
      
      return false;
    } catch (error) {
      console.error('Erreur demande permission:', error);
      toast({
        title: "Erreur",
        description: "Impossible de demander la permission pour les notifications",
        variant: "destructive",
      });
      return false;
    }
  };

  // S'abonner aux notifications push
  const subscribeUser = async (): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Clé publique VAPID (à remplacer par votre vraie clé)
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f8HtLlVLVWjSrOgAVmYTtQNUriAGemHCw0k1YPB7zNym6LkBDQU';
      
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      setSubscription(pushSubscription);

      toast({
        title: "🔔 Abonnement réussi",
        description: "Vous recevrez maintenant les notifications push",
      });

      return true;
    } catch (error) {
      console.error('Erreur abonnement push:', error);
      toast({
        title: "Erreur d'abonnement",
        description: "Impossible de s'abonner aux notifications push",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Envoyer une notification de test
  const sendTestNotification = async () => {
    if (permission !== 'granted') {
      toast({
        title: "Permission requise",
        description: "Veuillez d'abord autoriser les notifications",
        variant: "destructive",
      });
      return;
    }

    try {
      const notification = new Notification('🎉 AMORA Test', {
        body: 'Les notifications fonctionnent parfaitement !',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'test-notification',
        requireInteraction: false,
        silent: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('Erreur notification test:', error);
    }
  };

  return {
    permission,
    subscription,
    isSupported,
    loading,
    isSubscribed: !!subscription,
    requestPermission,
    subscribeUser,
    sendTestNotification
  };
};

// Fonction utilitaire pour convertir la clé VAPID
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}