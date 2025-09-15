import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PostContactRequest, ContactRequestResponse } from '../../types/feed';

interface UsePostContactReturn {
  createContactRequest: (postId: string, message?: string) => Promise<ContactRequestResponse>;
  acceptContactRequest: (requestId: string) => Promise<boolean>;
  declineContactRequest: (requestId: string) => Promise<boolean>;
  getContactRequests: (type: 'sent' | 'received') => Promise<PostContactRequest[]>;
  checkContactStatus: (postId: string, userId: string) => Promise<string>;
  loading: boolean;
}

export const usePostContact = (): UsePostContactReturn => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createContactRequest = useCallback(async (
    postId: string, 
    message?: string
  ): Promise<ContactRequestResponse> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_post_contact_request', {
        p_post_id: postId,
        p_message: message || null
      });

      if (error) throw error;

      toast({
        title: "Demande envoyée",
        description: "Votre demande de contact a été envoyée à l'auteur de la publication.",
      });

      return {
        success: true,
        contact_request_id: data,
        message: "Demande de contact créée avec succès"
      };
    } catch (error: any) {
      console.error('Erreur création demande contact:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer la demande de contact",
        variant: "destructive",
      });

      return {
        success: false,
        message: error.message || "Erreur lors de la création de la demande"
      };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const acceptContactRequest = useCallback(async (requestId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('accept_post_contact_request', {
        p_contact_request_id: requestId
      });

      if (error) throw error;

      toast({
        title: "Demande acceptée",
        description: "Vous pouvez maintenant échanger avec cette personne.",
      });

      return true;
    } catch (error: any) {
      console.error('Erreur acceptation demande:', error);
      
      toast({
        title: "Erreur",
        description: "Impossible d'accepter la demande",
        variant: "destructive",
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const declineContactRequest = useCallback(async (requestId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('decline_post_contact_request', {
        p_contact_request_id: requestId
      });

      if (error) throw error;

      toast({
        title: "Demande déclinée",
        description: "La demande de contact a été déclinée.",
      });

      return true;
    } catch (error: any) {
      console.error('Erreur déclinaison demande:', error);
      
      toast({
        title: "Erreur",
        description: "Impossible de décliner la demande",
        variant: "destructive",
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getContactRequests = useCallback(async (
    type: 'sent' | 'received'
  ): Promise<PostContactRequest[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('post_contact_requests')
        .select(`
          *,
          requester_profile:profiles!post_contact_requests_requester_id_fkey(
            id,
            full_name,
            avatar_url
          ),
          recipient_profile:profiles!post_contact_requests_recipient_id_fkey(
            id,
            full_name,
            avatar_url
          ),
          post:posts(
            id,
            content,
            created_at
          )
        `)
        .eq(type === 'sent' ? 'requester_id' : 'recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération demandes:', error);
      return [];
    }
  }, []);

  const checkContactStatus = useCallback(async (
    postId: string, 
    userId: string
  ): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'none';

      const { data, error } = await supabase
        .from('post_contact_requests')
        .select('status')
        .eq('post_id', postId)
        .eq('requester_id', user.id)
        .eq('recipient_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data?.status || 'none';
    } catch (error) {
      console.error('Erreur vérification statut:', error);
      return 'none';
    }
  }, []);

  return {
    createContactRequest,
    acceptContactRequest,
    declineContactRequest,
    getContactRequests,
    checkContactStatus,
    loading
  };
};