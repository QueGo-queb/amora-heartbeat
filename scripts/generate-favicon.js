import sharp from 'sharp';
import fs from 'fs';

const generateAmoraFavicon = async () => {
  console.log('🎨 Génération du favicon AMORA...');
  
  const logoPath = 'src/assets/amora-logo.png';
  
  // Vérifier que le logo existe
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Logo AMORA non trouvé:', logoPath);
    return;
  }

  try {
    // Générer favicon.ico (16x16 et 32x32)
    await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile('public/favicon.png');
    
    console.log('✅ favicon.png généré (32x32)');

    // Générer favicon.ico (format ICO)
    await sharp(logoPath)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile('public/favicon.ico');
    
    console.log('✅ favicon.ico généré (16x16)');

    // Générer favicon haute résolution pour les écrans Retina
    await sharp(logoPath)
      .resize(64, 64, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile('public/favicon-64x64.png');
    
    console.log('✅ favicon-64x64.png généré (Retina)');

    // Copier les icônes existantes pour les favicons
    await sharp('public/icons/icon-16x16.png')
      .toFile('public/favicon-16x16.png');
    
    await sharp('public/icons/icon-32x32.png')
      .toFile('public/favicon-32x32.png');
    
    console.log('✅ Favicons multiples générés');
    console.log('🎉 Favicon AMORA terminé !');
    
  } catch (error) {
    console.error('❌ Erreur génération favicon:', error);
  }
};

generateAmoraFavicon();
