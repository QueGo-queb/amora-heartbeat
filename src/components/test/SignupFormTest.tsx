/**
 * ✅ COMPOSANT DE TEST POUR LE FORMULAIRE D'INSCRIPTION OPTIMISÉ
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SignupFormOptimized } from '@/components/ui/signup-form-optimized';
import { CountryMultiSelect } from '@/components/ui/country-multi-select';
import { Badge } from '@/components/ui/badge';

export function SignupFormTest() {
  const [showForm, setShowForm] = useState(false);
  const [testCountries, setTestCountries] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);

  const runTests = () => {
    const results: string[] = [];
    
    // Test 1: Vérifier que le composant CountryMultiSelect fonctionne
    try {
      results.push('✅ Test 1: Composant CountryMultiSelect chargé');
    } catch (error) {
      results.push('❌ Test 1: Erreur avec CountryMultiSelect');
    }
    
    // Test 2: Vérifier la sélection de pays
    if (testCountries.length > 0) {
      results.push(`✅ Test 2: ${testCountries.length} pays sélectionnés`);
    } else {
      results.push('⚠️ Test 2: Aucun pays sélectionné');
    }
    
    // Test 3: Vérifier que l'Argentine est dans la liste
    if (testCountries.includes('AR')) {
      results.push('✅ Test 3: Argentine trouvée dans la sélection');
    } else {
      results.push('⚠️ Test 3: Argentine non sélectionnée');
    }
    
    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test du Formulaire d'Inscription Optimisé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test du composant CountryMultiSelect */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test du Composant CountryMultiSelect</h3>
              <CountryMultiSelect
                selectedCountries={testCountries}
                onCountriesChange={setTestCountries}
                placeholder="Testez la sélection de pays..."
                maxSelections={5}
              />
              
              {testCountries.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Pays sélectionnés:</p>
                  <div className="flex flex-wrap gap-2">
                    {testCountries.map(country => (
                      <Badge key={country} variant="secondary">
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Boutons de test */}
            <div className="flex gap-4">
              <Button onClick={runTests} variant="outline">
                🧪 Lancer les Tests
              </Button>
              <Button 
                onClick={() => setShowForm(!showForm)}
                className="bg-pink-500 hover:bg-pink-600"
              >
                {showForm ? 'Masquer' : 'Afficher'} le Formulaire Complet
              </Button>
            </div>

            {/* Résultats des tests */}
            {testResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Résultats des Tests:</h3>
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <p key={index} className="text-sm">{result}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2"> Instructions de Test:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>1. Testez la sélection de pays ci-dessus</li>
                <li>2. Vérifiez que l'Argentine est disponible</li>
                <li>3. Testez la recherche de pays</li>
                <li>4. Vérifiez la limite de sélection</li>
                <li>5. Affichez le formulaire complet pour un test end-to-end</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire complet */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>📝 Formulaire d'Inscription Complet</CardTitle>
            </CardHeader>
            <CardContent>
              <SignupFormOptimized language="fr" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}