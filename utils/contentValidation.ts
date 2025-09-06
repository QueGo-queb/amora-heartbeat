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
  
  export const validatePostContent = (content: string, isPremium: boolean) => {
    const detection = detectRestrictedContent(content);
    
    if (!isPremium && detection.hasRestrictedContent) {
      return {
        isValid: false,
        message: "Pour inclure un numéro de téléphone ou un lien dans votre publication, vous devez passer au plan Premium.",
        restrictedItems: detection.restrictedItems
      };
    }
  
    return {
      isValid: true,
      message: "Contenu valide"
    };
  };