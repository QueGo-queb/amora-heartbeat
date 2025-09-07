import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProfileViews = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Bouton de retour discret */}
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-8 h-8 text-green-500" />
            <h1 className="text-3xl font-bold">Vues de profil</h1>
          </div>
          
          <Card className="culture-card">
            <CardHeader>
              <CardTitle>Qui a consulté votre profil</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Découvrez qui s'intéresse à votre profil. 
                Ces personnes ont récemment visité votre page !
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileViews;
