import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputIcon = 'src/assets/amora.png';
const outputDir = 'public/icons';

// Fonction pour générer uniquement les icônes PWA principales
async function updatePWAIcons() {
  console.log('🎨 Mise à jour des icônes PWA principales avec amora.png...');
  
  // Vérifier que votre image existe
  if (!fs.existsSync(inputIcon)) {
    console.error('❌ Image non trouvée:', inputIcon);
    return;
  }
  
  // Créer le dossier si nécessaire
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    // Générer icon-512x512.png (icône principale PWA)
    await sharp(inputIcon)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 } // Fond transparent
      })
      .png({ 
        quality: 100, 
        compressionLevel: 6,
        adaptiveFiltering: true
      })
      .toFile(path.join(outputDir, 'icon-512x512.png'));
    
    console.log('✅ icon-512x512.png mis à jour avec votre logo');
    
    // Générer icon-512x512-maskable.png (version Android avec zone de sécurité)
    await sharp(inputIcon)
      .resize(432, 432, { // Réduire pour laisser de la marge
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .extend({
        top: 40, bottom: 40, left: 40, right: 40, // Ajouter du padding
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({ quality: 100 })
      .toFile(path.join(outputDir, 'icon-512x512-maskable.png'));
    
    console.log('✅ icon-512x512-maskable.png mis à jour avec zone de sécurité');
    
    console.log('🎉 Mise à jour terminée !');
    console.log('📱 Vos utilisateurs verront maintenant votre logo (sans texte) quand ils téléchargent la PWA');
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
  }
}

updatePWAIcons().catch(console.error);
