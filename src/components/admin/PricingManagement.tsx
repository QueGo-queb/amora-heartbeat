import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Star, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PricingService } from '@/lib/pricingService';
import type { SubscriptionPlan, CreatePlanRequest } from '../../../types/pricing';

export const PricingManagement: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<CreatePlanRequest>({
    name: '',
    description: '',
    duration_type: 'monthly',
    price_amount: 0,
    currency: 'USD',
    features: [],
    is_featured: false,
    sort_order: 0,
  });

  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const allPlans = await PricingService.getAllPlans();
      setPlans(allPlans);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les plans",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPlan) {
        // Mise à jour
        const success = await PricingService.updatePlan({
          id: editingPlan.id,
          ...formData
        });
        
        if (success) {
          toast({
            title: "Plan mis à jour",
            description: "Le plan a été mis à jour avec succès"
          });
        } else {
          throw new Error('Échec de la mise à jour');
        }
      } else {
        // Création
        const newPlan = await PricingService.createPlan(formData);
        
        if (newPlan) {
          toast({
            title: "Plan créé",
            description: "Le nouveau plan a été créé avec succès"
          });
        } else {
          throw new Error('Échec de la création');
        }
      }
      
      // Recharger et fermer le formulaire
      await loadPlans();
      resetForm();
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde du plan",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      duration_type: plan.duration_type,
      price_amount: plan.price_amount,
      currency: plan.currency,
      features: plan.features,
      is_featured: plan.is_featured,
      sort_order: plan.sort_order,
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (planId: string, planName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le plan "${planName}" ?`)) {
      return;
    }

    try {
      const success = await PricingService.deletePlan(planId);
      
      if (success) {
        toast({
          title: "Plan supprimé",
          description: "Le plan a été supprimé avec succès"
        });
        await loadPlans();
      } else {
        throw new Error('Échec de la suppression');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer ce plan (abonnements actifs ?)",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration_type: 'monthly',
      price_amount: 0,
      currency: 'USD',
      features: [],
      is_featured: false,
      sort_order: 0,
    });
    setEditingPlan(null);
    setShowCreateForm(false);
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <div>Chargement des plans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Prix</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Plan
        </Button>
      </div>

      {/* Liste des plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${!plan.is_active ? 'opacity-60' : ''}`}>
            {plan.is_featured && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-yellow-500">
                  <Star className="w-3 h-3 mr-1" />
                  Recommandé
                </Badge>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{plan.name}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(plan.id, plan.name)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardTitle>
              <div className="text-2xl font-bold flex items-center">
                <DollarSign className="w-5 h-5" />
                {PricingService.formatPrice(plan.price_amount, plan.currency)}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  /{plan.duration_type === 'monthly' ? 'mois' : plan.duration_type === 'yearly' ? 'an' : 'à vie'}
                </span>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {plan.description}
              </p>
              
              <div className="space-y-1">
                {plan.features.map((feature, index) => (
                  <div key={index} className="text-sm">
                    ✓ {feature}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                <span>Ordre: {plan.sort_order}</span>
                <Badge variant={plan.is_active ? "default" : "secondary"}>
                  {plan.is_active ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulaire de création/édition */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPlan ? 'Modifier le Plan' : 'Nouveau Plan'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du plan</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration_type">Type de durée</Label>
                  <Select
                    value={formData.duration_type}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, duration_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="yearly">Annuel</SelectItem>
                      <SelectItem value="lifetime">À vie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="price_amount">Prix</Label>
                  <Input
                    id="price_amount"
                    type="number"
                    step="0.01"
                    value={formData.price_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_amount: parseFloat(e.target.value) }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="currency">Devise</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="sort_order">Ordre d'affichage</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) }))}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                  <Label htmlFor="is_featured">Plan recommandé</Label>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              {/* Fonctionnalités */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Fonctionnalités</Label>
                  <Button type="button" size="sm" onClick={addFeature}>
                    <Plus className="w-3 h-3 mr-1" />
                    Ajouter
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Fonctionnalité..."
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingPlan ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
