#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('�� Début de la suppression du système i18n...');

// 1. Supprimer les fichiers i18n
const filesToRemove = [
  'src/lib/i18n.ts',
  'public/locales/en/common.json',
  'public/locales/fr/common.json'
];

filesToRemove.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`✅ Supprimé: ${file}`);
  }
});

// 2. Supprimer le dossier locales
const localesDir = 'public/locales';
if (fs.existsSync(localesDir)) {
  fs.rmSync(localesDir, { recursive: true, force: true });
  console.log(`✅ Supprimé le dossier: ${localesDir}`);
}

// 3. Remplacer les imports i18n dans les fichiers
const filesToUpdate = [
  'src/App.tsx',
  'src/components/ui/signup-form.tsx',
  'src/pages/Index.tsx'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Supprimer les imports i18n
    content = content.replace(/import.*i18n.*from.*['"]@\/lib\/i18n['"];?\n?/g, '');
    content = content.replace(/import.*useTranslation.*from.*['"]react-i18next['"];?\n?/g, '');
    
    // Remplacer useTranslation par le nouveau système
    content = content.replace(/const\s*{\s*t\s*}\s*=\s*useTranslation\(\);?/g, 'const { t } = useTranslation(getCurrentLanguage());');
    
    fs.writeFileSync(file, content);
    console.log(`✅ Mis à jour: ${file}`);
  }
});

console.log('🎉 Migration i18n terminée !');
console.log('�� Prochaines étapes:');
console.log('   1. npm run remove-i18n');
console.log('   2. Tester l\'application');
console.log('   3. Corriger les erreurs de compilation');
