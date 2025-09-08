import { useTranslation as useI18nTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

const localeMap = {
  fr: fr,
  en: enUS,
  ht: enUS // Fallback pour le créole
};

export const useTranslation = (namespace = 'common') => {
  const { t, i18n } = useI18nTranslation(namespace);
  
  const formatDate = (date: Date | string, formatStr = 'PPP') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = localeMap[i18n.language as keyof typeof localeMap] || fr;
    return format(dateObj, formatStr, { locale });
  };
  
  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency
    }).format(amount);
  };
  
  const formatNumber = (number: number) => {
    return new Intl.NumberFormat(i18n.language).format(number);
  };
  
  return {
    t,
    i18n,
    formatDate,
    formatCurrency,
    formatNumber,
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage,
    isRTL: ['ar', 'he', 'fa'].includes(i18n.language)
  };
};
