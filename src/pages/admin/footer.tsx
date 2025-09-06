/**
 * Page de gestion du footer
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Link, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeaderAdmin from '@/components/admin/HeaderAdmin';

const AdminFooter = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec bouton de retour */}
      <HeaderAdmin 
        title="Gestion du Footer"
        showBackButton={true}
        backTo="/admin"
        backLabel="Admin principal"
      />

      {/* Contenu principal */}
      <main className="container mx-auto py-8 px-4">
        {/* En-tête de la page */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">🔗 Gestion du Footer</h1>
              <p className="text-muted-foreground text-lg">
                Modifier le contenu du footer, les liens et les informations de contact
              </p>
            </div>
            
            <Button 
              onClick={() => navigate('/admin')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'admin
            </Button>
          </div>
        </div>

        {/* Sections du footer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Informations de contact */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Informations de Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>hello@amora.ca</span>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>+1 (514) 123-4567</span>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>123 Rue de l'Amour, Montréal, QC</span>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liens rapides */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5 text-green-600" />
                Liens Rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Accueil</span>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Comment ça marche</span>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Blog</span>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Carrières</span>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="culture-card">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Modifier le contenu
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Gérer les liens
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Mettre à jour les contacts
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminFooter;
