import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Messages = () => {
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
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        <p className="text-muted-foreground">
          Page des messages - Communiquez avec vos matches
        </p>
      </div>
    </div>
  );
};

export default Messages;
