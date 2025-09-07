import sharp from 'sharp';
import fs from 'fs';

// Créer le logo AMORA professionnel basé sur votre design
const createAmoraLogo = async (size = 1024) => {
  console.log('🎨 Création du logo AMORA professionnel...');
  
  // SVG du logo AMORA professionnel
  const logoSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradient pour le cœur - Orange -->
    <linearGradient id="heartOrange" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#D2691E;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#CD853F;stop-opacity:1" />
    </linearGradient>
    
    <!-- Gradient pour le cœur - Rouge -->
    <linearGradient id="heartRed" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#A0282C;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8B1538;stop-opacity:1" />
    </linearGradient>
    
    <!-- Gradient pour le cœur - Vert -->
    <linearGradient id="heartGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2F5233;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1B3B1E;stop-opacity:1" />
    </linearGradient>
    
    <!-- Ombre pour le texte -->
    <filter id="textShadow">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Fond transparent -->
  <rect width="${size}" height="${size}" fill="transparent"/>
  
  <!-- Cœur AMORA - Design professionnel -->
  <g transform="translate(${size/2}, ${size * 0.3})">
    <!-- Forme du cœur optimisée -->
    <path d="M 0,60 
             C -30,20 -70,20 -70,60 
             C -70,100 -30,140 0,180 
             C 30,140 70,100 70,60 
             C 70,20 30,20 0,60 Z" 
          fill="url(#heartRed)" 
          stroke="none"/>
    
    <!-- Partie orange (gauche) -->
    <path d="M 0,60 
             C -30,20 -70,20 -70,60 
             C -70,100 -30,140 0,180 
             L 0,60 Z" 
          fill="url(#heartOrange)" 
          opacity="0.8"/>
    
    <!-- Partie verte (droite) -->
    <path d="M 0,60 
             C 30,20 70,20 70,60 
             C 70,100 30,140 0,180 
             L 0,60 Z" 
          fill="url(#heartGreen)" 
          opacity="0.6"/>
  </g>
  
  <!-- Texte AMORA -->
  <text x="${size/2}" y="${size * 0.8}" 
        font-family="Georgia, Times, serif" 
        font-size="${size * 0.1}" 
        font-weight="bold" 
        text-anchor="middle" 
        fill="#8B1538"
        filter="url(#textShadow)">AMORA</text>
</svg>`;

  try {
    // Créer le dossier assets s'il n'existe pas
    if (!fs.existsSync('src/assets')) {
      fs.mkdirSync('src/assets', { recursive: true });
    }

    // Sauvegarder le SVG
    fs.writeFileSync('src/assets/amora-logo.svg', logoSvg);
    console.log('✅ Logo SVG créé : src/assets/amora-logo.svg');
    
    // Convertir en PNG haute qualité
    await sharp(Buffer.from(logoSvg))
      .png({ 
        quality: 100, 
        compressionLevel: 0,
        adaptiveFiltering: true 
      })
      .toFile('src/assets/amora-logo.png');
      
    console.log('✅ Logo PNG créé : src/assets/amora-logo.png');
    console.log('🎉 Logo AMORA professionnel terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du logo:', error);
  }
};

// Exécuter la création
createAmoraLogo().catch(console.error);
