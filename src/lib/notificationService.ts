import { supabase } from '@/integrations/supabase/client';

interface NotificationData {
  user_id: string;
  type: 'expiration_warning' | 'expiration_final' | 'renewal_success';
  language: string;
  subscription_id: string;
}

// Messages de notification multilingues
const NOTIFICATION_MESSAGES = {
  expiration_warning: {
    fr: {
      title: "⏰ Votre abonnement Premium expire bientôt",
      message: "Votre abonnement premium expire dans 7 jours. Renouvelez maintenant pour continuer à profiter des fonctionnalités premium."
    },
    en: {
      title: "⏰ Your Premium subscription expires soon",
      message: "Your premium subscription expires in 7 days. Renew now to continue enjoying premium features."
    },
    es: {
      title: "⏰ Su suscripción Premium expira pronto",
      message: "Su suscripción premium expira en 7 días. Renuévela ahora para seguir disfrutando de las funciones premium."
    }
  },
  expiration_final: {
    fr: {
      title: "🚨 Votre abonnement Premium a expiré",
      message: "Votre abonnement premium a expiré. Vous êtes maintenant sur le plan gratuit. Renouvelez pour retrouver l'accès premium."
    },
    en: {
      title: "🚨 Your Premium subscription has expired",
      message: "Your premium subscription has expired. You are now on the free plan. Renew to regain premium access."
    },
    es: {
      title: "🚨 Su suscripción Premium ha expirado",
      message: "Su suscripción premium ha expirado. Ahora está en el plan gratuito. Renueve para recuperar el acceso premium."
    }
  },
  renewal_success: {
    fr: {
      title: "✅ Abonnement Premium renouvelé",
      message: "Votre abonnement premium a été renouvelé avec succès pour 30 jours supplémentaires."
    },
    en: {
      title: "✅ Premium subscription renewed",
      message: "Your premium subscription has been successfully renewed for an additional 30 days."
    },
    es: {
      title: "✅ Suscripción Premium renovada",
      message: "Su suscripción premium ha sido renovada exitosamente por 30 días adicionales."
    }
  }
};

/**
 * Envoie une notification à un utilisateur
 */
export async function sendNotification(data: NotificationData): Promise<void> {
  try {
    const messages = NOTIFICATION_MESSAGES[data.type];
    const userLanguage = data.language || 'fr';
    const message = messages[userLanguage as keyof typeof messages] || messages.fr;

    const { error } = await supabase
      .from('premium_notifications')
      .insert({
        user_id: data.user_id,
        type: data.type,
        title: message.title,
        message: message.message,
        language: userLanguage,
        subscription_id: data.subscription_id,
        sent_at: new Date().toISOString()
      });

    if (error) throw error;

    console.log(`Notification ${data.type} envoyée à l'utilisateur ${data.user_id}`);
  } catch (error) {
    console.error('Erreur envoi notification:', error);
    throw error;
  }
}

/**
 * Marque une notification comme lue
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('premium_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Erreur marquage notification:', error);
    throw error;
  }
}

/**
 * Récupère les notifications non lues d'un utilisateur
 */
export async function getUnreadNotifications(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('premium_notifications')
      .select('*')
      .eq('user_id', userId)
      .is('read_at', null)
      .order('sent_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    return [];
  }
}

/**
 * Fonction pour vérifier et envoyer les notifications d'expiration
 * Cette fonction sera appelée par une tâche cron ou un trigger
 */
export async function checkAndSendExpirationNotifications(): Promise<void> {
  try {
    // Récupérer les abonnements qui expirent dans 7 jours
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: expiringSoon, error: expiringSoonError } = await supabase
      .from('premium_subscriptions')
      .select(`
        *,
        users:auth.users(email, raw_user_meta_data)
      `)
      .eq('status', 'active')
      .eq('notification_sent', false)
      .lte('end_date', sevenDaysFromNow.toISOString())
      .gt('end_date', new Date().toISOString());

    if (expiringSoonError) throw expiringSoonError;

    // Envoyer les notifications d'avertissement
    for (const subscription of expiringSoon || []) {
      const userLanguage = subscription.users?.raw_user_meta_data?.language || 'fr';
      
      await sendNotification({
        user_id: subscription.user_id,
        type: 'expiration_warning',
        language: userLanguage,
        subscription_id: subscription.id
      });

      // Marquer comme notification envoyée
      await supabase
        .from('premium_subscriptions')
        .update({ notification_sent: true })
        .eq('id', subscription.id);
    }

    // Récupérer les abonnements expirés
    const { data: expired, error: expiredError } = await supabase
      .from('premium_subscriptions')
      .select(`
        *,
        users:auth.users(email, raw_user_meta_data)
      `)
      .eq('status', 'active')
      .lt('end_date', new Date().toISOString());

    if (expiredError) throw expiredError;

    // Traiter les abonnements expirés
    for (const subscription of expired || []) {
      const userLanguage = subscription.users?.raw_user_meta_data?.language || 'fr';
      
      // Envoyer notification d'expiration
      await sendNotification({
        user_id: subscription.user_id,
        type: 'expiration_final',
        language: userLanguage,
        subscription_id: subscription.id
      });

      // Marquer l'abonnement comme expiré
      await supabase
        .from('premium_subscriptions')
        .update({ 
          status: 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      // Rétrograder l'utilisateur au plan gratuit
      await supabase.auth.admin.updateUserById(subscription.user_id, {
        user_metadata: { plan: 'free' }
      });
    }

    console.log(`Processed ${expiringSoon?.length || 0} expiring subscriptions and ${expired?.length || 0} expired subscriptions`);
  } catch (error) {
    console.error('Erreur vérification notifications expiration:', error);
    throw error;
  }
}
