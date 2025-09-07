import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const inputIcon = 'src/assets/amora-logo.png';
const outputDir = 'public/icons';

// Créer le dossier de sortie
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Générer les icônes PWA
async function generateIcons() {
  console.log('🎨 Génération des icônes PWA professionnelles...');
  
  // Vérifier que le logo source existe
  if (!fs.existsSync(inputIcon)) {
    console.error('❌ Logo source non trouvé:', inputIcon);
    console.log('💡 Veuillez d\'abord exécuter: node scripts/create-amora-logo.js');
    return;
  }
  
  for (const size of sizes) {
    try {
      await sharp(inputIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 },
          withoutEnlargement: false
        })
        .png({ 
          quality: 100, 
          compressionLevel: 6,
          adaptiveFiltering: true
        })
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
      
      console.log(`✅ Icône ${size}x${size} générée (qualité professionnelle)`);
    } catch (error) {
      console.error(`❌ Erreur génération ${size}x${size}:`, error);
    }
  }
  
  // Générer favicon.ico optimisé
  try {
    await sharp(inputIcon)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({ quality: 100 })
      .toFile('public/favicon.png');
      
    // Créer aussi une version ICO
    await sharp(inputIcon)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile('public/favicon.ico');
      
    console.log('✅ Favicon généré (PNG + ICO)');
  } catch (error) {
    console.error('❌ Erreur génération favicon:', error);
  }
  
  // Générer les icônes Apple Touch spécifiques
  const appleSizes = [57, 60, 72, 76, 114, 120, 144, 152, 180];
  
  for (const size of appleSizes) {
    try {
      await sharp(inputIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 } // Fond blanc pour Apple
        })
        .png({ quality: 100 })
        .toFile(path.join(outputDir, `apple-touch-icon-${size}x${size}.png`));
        
      console.log(`✅ Icône Apple ${size}x${size} générée`);
    } catch (error) {
      console.error(`❌ Erreur Apple ${size}x${size}:`, error);
    }
  }
  
  // Générer les icônes maskable (Android)
  try {
    // Version avec padding pour maskable
    await sharp(inputIcon)
      .resize(432, 432, { // 512 - 80px de padding
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .extend({
        top: 40, bottom: 40, left: 40, right: 40,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({ quality: 100 })
      .toFile(path.join(outputDir, 'icon-512x512-maskable.png'));
      
    console.log('✅ Icône maskable Android générée');
  } catch (error) {
    console.error('❌ Erreur icône maskable:', error);
  }
  
  console.log('🎉 Génération complète terminée !');
  console.log('📊 Résumé:');
  console.log(`   - ${sizes.length} icônes PWA standard`);
  console.log(`   - ${appleSizes.length} icônes Apple Touch`);
  console.log('   - 1 icône maskable Android');
  console.log('   - 1 favicon (PNG + ICO)');
}

generateIcons().catch(console.error);

