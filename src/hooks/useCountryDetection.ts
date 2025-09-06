import { useState, useEffect } from 'react';

interface CountryInfo {
  country: string;
  countryCode: string;
  currency: string;
  timezone: string;
}

export function useCountryDetection() {
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectCountry();
  }, []);

  const detectCountry = async () => {
    try {
      // Méthode 1: Utiliser l'API de géolocalisation IP
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.country_name) {
        setCountryInfo({
          country: data.country_name,
          countryCode: data.country_code,
          currency: data.currency,
          timezone: data.timezone
        });
      } else {
        // Méthode 2: Fallback avec timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const country = getCountryFromTimezone(timezone);
        setCountryInfo({
          country,
          countryCode: getCountryCode(country),
          currency: 'USD',
          timezone
        });
      }
    } catch (error) {
      console.error('Erreur détection pays:', error);
      // Fallback par défaut
      setCountryInfo({
        country: 'International',
        countryCode: 'XX',
        currency: 'USD',
        timezone: 'UTC'
      });
    } finally {
      setLoading(false);
    }
  };

  const getCountryFromTimezone = (timezone: string): string => {
    const timezoneMap: Record<string, string> = {
      'America/Toronto': 'Canada',
      'America/Vancouver': 'Canada',
      'America/Montreal': 'Canada',
      'America/New_York': 'États-Unis',
      'America/Los_Angeles': 'États-Unis',
      'America/Chicago': 'États-Unis',
      'America/Port-au-Prince': 'Haïti',
      'America/Santiago': 'Chili',
      'America/Sao_Paulo': 'Brésil',
      'Europe/Paris': 'France',
      'Europe/London': 'Royaume-Uni'
    };

    return timezoneMap[timezone] || 'International';
  };

  const getCountryCode = (country: string): string => {
    const countryCodeMap: Record<string, string> = {
      'Canada': 'CA',
      'États-Unis': 'US',
      'Haïti': 'HT',
      'Chili': 'CL',
      'Brésil': 'BR',
      'France': 'FR',
      'Royaume-Uni': 'GB'
    };

    return countryCodeMap[country] || 'XX';
  };

  return {
    countryInfo,
    loading,
    refreshCountry: detectCountry
  };
}
