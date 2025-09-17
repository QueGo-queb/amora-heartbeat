#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('�� Remplacement du formulaire d\'inscription...');

// 1. Sauvegarder l'ancien formulaire
const oldFormPath = 'src/components/ui/signup-form.tsx';
const backupPath = 'src/components/ui/signup-form-backup.tsx';

if (fs.existsSync(oldFormPath)) {
  console.log('📦 Sauvegarde de l\'ancien formulaire...');
  fs.copyFileSync(oldFormPath, backupPath);
  console.log(`✅ Ancien formulaire sauvegardé dans ${backupPath}`);
}

// 2. Remplacer par le nouveau formulaire
const newFormPath = 'src/components/ui/signup-form-optimized.tsx';
const targetPath = 'src/components/ui/signup-form.tsx';

if (fs.existsSync(newFormPath)) {
  console.log('🔄 Remplacement du formulaire...');
  fs.copyFileSync(newFormPath, targetPath);
  console.log('✅ Nouveau formulaire installé');
} else {
  console.log('❌ Fichier signup-form-optimized.tsx non trouvé');
  process.exit(1);
}

// 3. Mettre à jour les imports si nécessaire
console.log('�� Vérification des imports...');

// Vérifier les fichiers qui importent le formulaire
const filesToCheck = [
  'src/pages/Auth.tsx',
  'src/App.tsx',
  'src/pages/Index.tsx'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      
      // Remplacer les imports si nécessaire
      if (content.includes('SignupForm')) {
        console.log(`✅ ${file} - Import SignupForm trouvé`);
      }
    } catch (error) {
      console.log(`⚠️ Erreur lors de la lecture de ${file}`);
    }
  }
});

console.log('\n�� Remplacement terminé !');
console.log('📝 N\'oubliez pas de:');
console.log('1. Exécuter la migration de base de données');
console.log('2. Tester l\'inscription complète');
console.log('3. Vérifier que les pays ciblés sont sauvegardés');
