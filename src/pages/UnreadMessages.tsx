import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UnreadMessages = () => {
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
            <MessageCircle className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Messages non lus</h1>
          </div>
          
          <Card className="culture-card">
            <CardHeader>
              <CardTitle>Vos messages non lus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Retrouvez ici tous les messages que vous n'avez pas encore lus. 
                Ne manquez aucune conversation importante !
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UnreadMessages;
