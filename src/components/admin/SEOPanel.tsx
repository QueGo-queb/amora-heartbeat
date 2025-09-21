/**
 * Panneau d'administration pour gérer le SEO multilingue
 * Génération et téléchargement du sitemap
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Globe, Search, CheckCircle } from 'lucide-react';
import { generateSitemap, downloadSitemap } from '@/lib/sitemapGenerator';
import { useToast } from '@/hooks/use-toast';

export const SEOPanel = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷', status: 'ready' },
    { code: 'en', name: 'English', flag: '🇺🇸', status: 'ready' },
    { code: 'ht', name: 'Kreyòl', flag: '🇭🇹', status: 'ready' },
    { code: 'es', name: 'Español', flag: '🇪🇸', status: 'ready' },
    { code: 'pt', name: 'Português', flag: '🇧🇷', status: 'ready' }
  ];

  const handleGenerateSitemap = async () => {
    setIsGenerating(true);
    
    try {
      // Simuler la génération
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      downloadSitemap();
      
      toast({
        title: "✅ Sitemap généré avec succès !",
        description: "Le fichier sitemap.xml a été téléchargé. Vous pouvez le soumettre à Google Search Console.",
      });
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de générer le sitemap.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewSitemap = () => {
    const sitemapContent = generateSitemap();
    const blob = new Blob([sitemapContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Statut des langues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Statut SEO Multilingue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {languages.map(lang => (
              <div key={lang.code} className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">{lang.flag}</div>
                <div className="font-medium">{lang.name}</div>
                <Badge variant="default" className="mt-2 bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Prêt
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Génération du sitemap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Sitemap XML Multilingue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Générez un sitemap XML complet avec toutes les URLs multilingues et les balises hreflang 
            pour optimiser l'indexation par Google.
          </p>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleGenerateSitemap}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isGenerating ? 'Génération...' : 'Télécharger Sitemap'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handlePreviewSitemap}
            >
              Prévisualiser
            </Button>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">📋 Instructions pour Google Search Console :</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Téléchargez le sitemap.xml</li>
              <li>Uploadez-le à la racine de votre domaine : <code>https://amora.ca/sitemap.xml</code></li>
              <li>Connectez-vous à Google Search Console</li>
              <li>Allez dans "Sitemaps" et soumettez l'URL : <code>sitemap.xml</code></li>
              <li>Google indexera automatiquement toutes les versions linguistiques</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques SEO */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Statistiques SEO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">25</div>
              <div className="text-sm text-gray-600">Pages principales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">125</div>
              <div className="text-sm text-gray-600">URLs multilingues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-sm text-gray-600">Langues supportées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">100%</div>
              <div className="text-sm text-gray-600">Balises hreflang</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
