/// <reference types="vite/client" />

// Types pour Google Translate
declare global {
  interface Window {
    google: any;
    changeLanguage: (langCode: string) => void;
    googleTranslateElementInit: () => void;
  }
}
