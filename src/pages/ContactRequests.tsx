
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePostContact } from '@/hooks/usePostContact';
import type { PostContactRequest } from '../../types/feed';

const ContactRequests = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [requests, setRequests] = useState<PostContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const { 
    getContactRequests, 
    acceptContactRequest, 
    declineContactRequest 
  } = usePostContact();

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const loadRequests = async () => {
    setLoading(true);
    const data = await getContactRequests(activeTab);
    setRequests(data);
    setLoading(false);
  };

  const handleAccept = async (requestId: string) => {
    const success = await acceptContactRequest(requestId);
    if (success) {
      loadRequests(); // Recharger la liste
    }
  };

  const handleDecline = async (requestId: string) => {
    const success = await declineContactRequest(requestId);
    if (success) {
      loadRequests(); // Recharger la liste
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'accepted':
        return <Badge variant="default"><Check className="w-3 h-3 mr-1" />Accepté</Badge>;
      case 'declined':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Décliné</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Demandes de contact</h1>
            <p className="text-sm text-gray-600">Gérez vos demandes de contact depuis les publications</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('received')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'received'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Demandes reçues
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Demandes envoyées
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-6 px-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : requests.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune demande {activeTab === 'received' ? 'reçue' : 'envoyée'}
              </h3>
              <p className="text-gray-600">
                {activeTab === 'received' 
                  ? 'Vous n\'avez pas encore reçu de demandes de contact.' 
                  : 'Vous n\'avez pas encore envoyé de demandes de contact.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={
                          activeTab === 'received' 
                            ? request.requester_profile?.avatar_url
                            : request.recipient_profile?.avatar_url
                        } />
                        <AvatarFallback>
                          {(activeTab === 'received' 
                            ? request.requester_profile?.full_name 
                            : request.recipient_profile?.full_name
                          )?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">
                          {activeTab === 'received' 
                            ? request.requester_profile?.full_name 
                            : request.recipient_profile?.full_name
                          }
                        </h3>
                        
                        {request.message && (
                          <p className="text-sm text-gray-600 mt-1">
                            "{request.message}"
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(request.status)}
                          <span className="text-xs text-gray-500">
                            {new Date(request.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {activeTab === 'received' && request.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDecline(request.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decliner
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAccept(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accepter
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactRequests;