import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { footerTranslations } from "@/lib/footerTranslations";
import { useLanguage } from "@/contexts/LanguageContext";

const FAQPage = () => {
  const navigate = useNavigate();
  const { selectedLanguage } = useLanguage();
  const t = footerTranslations[selectedLanguage as keyof typeof footerTranslations];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t?.back || "Retour"}
          </Button>
          
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="h-8 w-8 text-pink-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              {t?.pageContent?.faq?.title || "FAQ"}
            </h1>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-pink-600">
              {t?.pageContent?.faq?.title || "FAQ"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-pink max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: t?.pageContent?.faq?.content || "Contenu non disponible" 
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQPage;
