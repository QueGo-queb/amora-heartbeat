/**
 * Service de conversion de devises utilisant une API gratuite
 * Utilise ExchangeRate-API qui offre 1500 requêtes gratuites par mois
 */

interface ExchangeRates {
  USD: number;
  EUR: number;
  CAD: number;
  HTG: number;
  CLP: number;
}

interface ConversionResult {
  price_usd: number;
  price_eur: number;
  price_cad: number;
  price_htg: number;
  price_clp: number;
  rates: ExchangeRates;
  last_updated: string;
}

const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

// Cache des taux pour éviter trop d'appels API
let ratesCache: { rates: ExchangeRates; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 heure

/**
 * Récupère les taux de change actuels depuis l'API
 */
async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    // Vérifier le cache
    if (ratesCache && (Date.now() - ratesCache.timestamp) < CACHE_DURATION) {
      return ratesCache.rates;
    }

    const response = await fetch(EXCHANGE_API_URL);
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    
    const rates: ExchangeRates = {
      USD: 1,
      EUR: data.rates.EUR || 0.85,
      CAD: data.rates.CAD || 1.35,
      HTG: data.rates.HTG || 130,
      CLP: data.rates.CLP || 800
    };

    // Mettre en cache
    ratesCache = {
      rates,
      timestamp: Date.now()
    };

    return rates;
  } catch (error) {
    console.error('Erreur récupération taux de change:', error);
    
    // Taux de fallback en cas d'erreur API
    return {
      USD: 1,
      EUR: 0.85,
      CAD: 1.35,
      HTG: 130,
      CLP: 800
    };
  }
}

/**
 * Convertit un prix USD vers toutes les devises supportées
 */
export async function convertPriceFromUSD(priceUSD: number): Promise<ConversionResult> {
  const rates = await fetchExchangeRates();
  
  return {
    price_usd: Number(priceUSD.toFixed(2)),
    price_eur: Number((priceUSD * rates.EUR).toFixed(2)),
    price_cad: Number((priceUSD * rates.CAD).toFixed(2)),
    price_htg: Number((priceUSD * rates.HTG).toFixed(0)),
    price_clp: Number((priceUSD * rates.CLP).toFixed(0)),
    rates,
    last_updated: new Date().toISOString()
  };
}

/**
 * Formate un prix selon la devise
 */
export function formatPrice(amount: number, currency: string): string {
  switch (currency.toUpperCase()) {
    case 'EUR':
      return `€${amount.toFixed(2)}`;
    case 'CAD':
      return `$${amount.toFixed(2)} CAD`;
    case 'CLP':
      return `$${amount.toLocaleString()} CLP`;
    case 'HTG':
      return `${amount.toLocaleString()} G`;
    case 'USD':
    default:
      return `$${amount.toFixed(2)}`;
  }
}

/**
 * Invalide le cache des taux de change
 */
export function invalidateRatesCache(): void {
  ratesCache = null;
}