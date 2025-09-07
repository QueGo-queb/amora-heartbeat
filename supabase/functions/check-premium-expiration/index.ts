import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting premium subscription expiration check...')

    // Check for subscriptions expiring in 7 days (and not already notified)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const { data: expiringSoon, error: expiringSoonError } = await supabaseAdmin
      .from('premium_subscriptions')
      .select(`
        *,
        users:auth.users(email, raw_user_meta_data)
      `)
      .eq('status', 'active')
      .eq('notification_sent', false)
      .lte('end_date', sevenDaysFromNow.toISOString())
      .gt('end_date', new Date().toISOString())

    if (expiringSoonError) {
      console.error('Error fetching expiring subscriptions:', expiringSoonError)
      throw expiringSoonError
    }

    console.log(`Found ${expiringSoon?.length || 0} subscriptions expiring soon`)

    // Send warning notifications
    for (const subscription of expiringSoon || []) {
      const userLanguage = subscription.users?.raw_user_meta_data?.language || 'fr'
      
      const notificationMessages = {
        fr: {
          title: "⏰ Votre abonnement Premium expire bientôt",
          message: "Votre abonnement premium expire dans 7 jours. Renouvelez maintenant pour continuer à profiter des fonctionnalités premium."
        },
        en: {
          title: "⏰ Your Premium subscription expires soon", 
          message: "Your premium subscription expires in 7 days. Renew now to continue enjoying premium features."
        }
      }

      const message = notificationMessages[userLanguage as keyof typeof notificationMessages] || notificationMessages.fr

      // Insert notification
      const { error: notifError } = await supabaseAdmin
        .from('premium_notifications')
        .insert({
          user_id: subscription.user_id,
          type: 'expiration_warning',
          title: message.title,
          message: message.message,
          language: userLanguage,
          subscription_id: subscription.id
        })

      if (notifError) {
        console.error('Error sending notification:', notifError)
        continue
      }

      // Mark as notified
      await supabaseAdmin
        .from('premium_subscriptions')
        .update({ notification_sent: true })
        .eq('id', subscription.id)

      console.log(`Warning notification sent to user ${subscription.user_id}`)
    }

    // Check for expired subscriptions
    const { data: expired, error: expiredError } = await supabaseAdmin
      .from('premium_subscriptions')
      .select(`
        *,
        users:auth.users(email, raw_user_meta_data)
      `)
      .in('status', ['active', 'expiring'])
      .lt('end_date', new Date().toISOString())

    if (expiredError) {
      console.error('Error fetching expired subscriptions:', expiredError)
      throw expiredError
    }

    console.log(`Found ${expired?.length || 0} expired subscriptions`)

    // Process expired subscriptions
    for (const subscription of expired || []) {
      const userLanguage = subscription.users?.raw_user_meta_data?.language || 'fr'
      
      const expiredMessages = {
        fr: {
          title: "🚨 Votre abonnement Premium a expiré",
          message: "Votre abonnement premium a expiré. Vous êtes maintenant sur le plan gratuit. Renouvelez pour retrouver l'accès premium."
        },
        en: {
          title: "🚨 Your Premium subscription has expired",
          message: "Your premium subscription has expired. You are now on the free plan. Renew to regain premium access."
        }
      }

      const message = expiredMessages[userLanguage as keyof typeof expiredMessages] || expiredMessages.fr

      // Send expiration notification
      const { error: expiredNotifError } = await supabaseAdmin
        .from('premium_notifications')
        .insert({
          user_id: subscription.user_id,
          type: 'expiration_final',
          title: message.title,
          message: message.message,
          language: userLanguage,
          subscription_id: subscription.id
        })

      if (expiredNotifError) {
        console.error('Error sending expiration notification:', expiredNotifError)
      }

      // Mark subscription as expired
      await supabaseAdmin
        .from('premium_subscriptions')
        .update({ 
          status: 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id)

      // Downgrade user to free plan
      const { error: userUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        subscription.user_id,
        {
          user_metadata: { plan: 'free' }
        }
      )

      if (userUpdateError) {
        console.error('Error downgrading user:', userUpdateError)
      }

      console.log(`User ${subscription.user_id} downgraded to free plan`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: {
          expiring_soon: expiringSoon?.length || 0,
          expired: expired?.length || 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in check-premium-expiration function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
