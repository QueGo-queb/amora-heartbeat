// Détection des numéros de téléphone et liens
export const detectRestrictedContent = (content: string) => {
    const phoneRegex = /(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}/g;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\b)/g;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  
    const phones = content.match(phoneRegex) || [];
    const urls = content.match(urlRegex) || [];
    const emails = content.match(emailRegex) || [];
  
    return {
      hasRestrictedContent: phones.length > 0 || urls.length > 0 || emails.length > 0,
      phones,
      urls,
      emails,
      restrictedItems: [...phones, ...urls, ...emails]
    };
  };
  
  export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }

  export function validatePostContent(content: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation de la longueur
    if (!content || content.trim().length === 0) {
      errors.push('Le contenu ne peut pas être vide');
    }

    if (content.length > 5000) {
      errors.push('Le contenu ne peut pas dépasser 5000 caractères');
    }

    // Validation des mots interdits (exemple basique)
    const forbiddenWords = ['spam', 'hack', 'virus'];
    const lowerContent = content.toLowerCase();
    
    forbiddenWords.forEach(word => {
      if (lowerContent.includes(word)) {
        warnings.push(`Contenu potentiellement inapproprié détecté: "${word}"`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }