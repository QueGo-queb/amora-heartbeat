import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const SupportDedie = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation simple
    if (!formData.subject || !formData.message) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    // Ici vous pourriez envoyer le message à votre système de support
    console.log('Message de support:', formData);
    
    toast({
      title: "Message envoyé",
      description: "Votre message a été envoyé à notre équipe support"
    });

    // Reset form
    setFormData({
      subject: '',
      category: '',
      message: '',
      email: '',
      phone: ''
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Bouton de retour */}
      <div className="container mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au fil d'actualité
        </Button>
      </div>

      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Support Dédié</h1>
          </div>
          
          <Card className="culture-card">
            <CardHeader>
              <CardTitle>Contactez notre équipe</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Catégorie *
                  </label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Problème technique</SelectItem>
                      <SelectItem value="account">Compte utilisateur</SelectItem>
                      <SelectItem value="payment">Paiement</SelectItem>
                      <SelectItem value="report">Signaler un utilisateur</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Sujet *
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Résumé de votre problème"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Message *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Décrivez votre problème en détail..."
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Email (optionnel)
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Téléphone (optionnel)
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer le message
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t">
                <h3 className="font-semibold mb-3">Autres moyens de contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4" />
                    <span>support@amora.app</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4" />
                    <span>+33 1 23 45 67 89</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupportDedie;
