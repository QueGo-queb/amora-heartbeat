import { trackEvent, trackError } from './sentry';

// Types pour l'API OpenAI Moderation
interface OpenAIModerationResponse {
  id: string;
  model: string;
  results: Array<{
    flagged: boolean;
    categories: {
      sexual: boolean;
      hate: boolean;
      harassment: boolean;
      'self-harm': boolean;
      'sexual/minors': boolean;
      'hate/threatening': boolean;
      'violence/graphic': boolean;
      'self-harm/intent': boolean;
      'self-harm/instructions': boolean;
      'harassment/threatening': boolean;
      violence: boolean;
    };
    category_scores: {
      sexual: number;
      hate: number;
      harassment: number;
      'self-harm': number;
      'sexual/minors': number;
      'hate/threatening': number;
      'violence/graphic': number;
      'self-harm/intent': number;
      'self-harm/instructions': number;
      'harassment/threatening': number;
      violence: number;
    };
  }>;
}

export interface ModerationResult {
  isFlagged: boolean;
  confidence: number;
  categories: {
    toxic: boolean;
    spam: boolean;
    harassment: boolean;
    hateSpeech: boolean;
    sexualContent: boolean;
    violence: boolean;
    selfHarm: boolean;
  };
  scores: {
    toxicity: number;
    spam: number;
    harassment: number;
    hateSpeech: number;
    sexualContent: number;
    violence: number;
    selfHarm: number;
  };
  action: 'approve' | 'flag' | 'reject';
  explanation: string;
  processingTimeMs: number;
  provider: 'openai' | 'custom';
}

class AIModerationService {
  private readonly openaiApiKey: string;
  private readonly baseUrl = 'https://api.openai.com/v1/moderations';

  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    
    if (!this.openaiApiKey) {
      console.warn('⚠️ OpenAI API key not found. AI moderation will use fallback method.');
    }
  }

  /**
   * Modère du contenu avec l'API OpenAI Moderation
   */
  async moderateContent(content: string, contentType: string = 'text'): Promise<ModerationResult> {
    const startTime = performance.now();
    
    try {
      // Validation de base
      if (!content || content.trim().length === 0) {
        return this.createSafeResult(performance.now() - startTime);
      }

      // Nettoyage du contenu
      const cleanContent = this.preprocessContent(content);
      
      // Si pas d'API key, utiliser la modération de base
      if (!this.openaiApiKey) {
        return this.fallbackModeration(cleanContent, performance.now() - startTime);
      }

      // Appel à l'API OpenAI
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: cleanContent,
          model: 'text-moderation-latest'
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenAIModerationResponse = await response.json();
      const processingTime = performance.now() - startTime;
      
      const result = this.parseOpenAIResponse(data, processingTime);
      
      trackEvent('ai_moderation_completed', {
        content_type: contentType,
        is_flagged: result.isFlagged,
        confidence: result.confidence,
        processing_time: processingTime,
        provider: 'openai'
      });

      return result;

    } catch (error) {
      const processingTime = performance.now() - startTime;
      
      trackError(error, { 
        context: 'aiModeration.moderateContent', 
        contentType,
        processingTime 
      });

      console.error('AI Moderation error:', error);
      
      // En cas d'erreur, utiliser la modération de fallback
      return this.fallbackModeration(content, processingTime);
    }
  }

  /**
   * Modération de fallback basée sur des règles simples
   */
  private fallbackModeration(content: string, processingTime: number): ModerationResult {
    const lowerContent = content.toLowerCase();
    
    // Mots-clés suspects (liste simplifiée pour l'exemple)
    const toxicKeywords = ['insulte', 'idiot', 'con', 'salope', 'connard'];
    const spamKeywords = ['viagra', 'casino', 'gagnez', 'gratuit', 'argent facile'];
    const harassmentKeywords = ['stalker', 'harceler', 'menacer'];
    
    let toxicityScore = 0;
    let spamScore = 0;
    let harassmentScore = 0;
    
    // Calcul des scores
    toxicKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) toxicityScore += 0.3;
    });
    
    spamKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) spamScore += 0.4;
    });
    
    harassmentKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) harassmentScore += 0.5;
    });

    // Détection de patterns suspects
    if (content.length > 500 && content.split(' ').length < 10) {
      spamScore += 0.3; // Beaucoup de caractères, peu de mots = possible spam
    }

    if (content.split('!').length > 5) {
      toxicityScore += 0.2; // Trop d'exclamations
    }

    const maxScore = Math.max(toxicityScore, spamScore, harassmentScore);
    const isFlagged = maxScore > 0.6;
    
    let action: 'approve' | 'flag' | 'reject' = 'approve';
    if (maxScore > 0.8) action = 'reject';
    else if (maxScore > 0.5) action = 'flag';

    return {
      isFlagged,
      confidence: Math.min(maxScore, 1),
      categories: {
        toxic: toxicityScore > 0.5,
        spam: spamScore > 0.5,
        harassment: harassmentScore > 0.5,
        hateSpeech: false,
        sexualContent: false,
        violence: false,
        selfHarm: false,
      },
      scores: {
        toxicity: Math.min(toxicityScore, 1),
        spam: Math.min(spamScore, 1),
        harassment: Math.min(harassmentScore, 1),
        hateSpeech: 0,
        sexualContent: 0,
        violence: 0,
        selfHarm: 0,
      },
      action,
      explanation: isFlagged 
        ? `Contenu signalé: ${toxicityScore > 0.5 ? 'toxique ' : ''}${spamScore > 0.5 ? 'spam ' : ''}${harassmentScore > 0.5 ? 'harcèlement' : ''}`.trim()
        : 'Contenu approuvé',
      processingTimeMs: Math.round(processingTime),
      provider: 'custom'
    };
  }

  /**
   * Parse la réponse de l'API OpenAI
   */
  private parseOpenAIResponse(data: OpenAIModerationResponse, processingTime: number): ModerationResult {
    const result = data.results[0];
    
    const categories = result.categories;
    const scores = result.category_scores;
    
    // Calcul du score de confiance global
    const maxScore = Math.max(...Object.values(scores));
    const isFlagged = result.flagged;
    
    let action: 'approve' | 'flag' | 'reject' = 'approve';
    if (isFlagged && maxScore > 0.8) action = 'reject';
    else if (isFlagged || maxScore > 0.6) action = 'flag';

    // Explication des catégories détectées
    const flaggedCategories = Object.entries(categories)
      .filter(([_, flagged]) => flagged)
      .map(([category]) => this.translateCategory(category));
    
    const explanation = isFlagged
      ? `Contenu signalé pour: ${flaggedCategories.join(', ')}`
      : 'Contenu approuvé par l\'IA';

    return {
      isFlagged,
      confidence: maxScore,
      categories: {
        toxic: categories.hate || categories.harassment,
        spam: false, // OpenAI ne détecte pas le spam directement
        harassment: categories.harassment || categories['harassment/threatening'],
        hateSpeech: categories.hate || categories['hate/threatening'],
        sexualContent: categories.sexual || categories['sexual/minors'],
        violence: categories.violence || categories['violence/graphic'],
        selfHarm: categories['self-harm'] || categories['self-harm/intent'] || categories['self-harm/instructions'],
      },
      scores: {
        toxicity: Math.max(scores.hate, scores.harassment),
        spam: 0,
        harassment: Math.max(scores.harassment, scores['harassment/threatening']),
        hateSpeech: Math.max(scores.hate, scores['hate/threatening']),
        sexualContent: Math.max(scores.sexual, scores['sexual/minors']),
        violence: Math.max(scores.violence, scores['violence/graphic']),
        selfHarm: Math.max(scores['self-harm'], scores['self-harm/intent'], scores['self-harm/instructions']),
      },
      action,
      explanation,
      processingTimeMs: Math.round(processingTime),
      provider: 'openai'
    };
  }

  /**
   * Préprocesse le contenu avant modération
   */
  private preprocessContent(content: string): string {
    return content
      .trim()
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .substring(0, 2000); // Limiter la taille pour l'API
  }

  /**
   * Traduit les catégories OpenAI en français
   */
  private translateCategory(category: string): string {
    const translations: Record<string, string> = {
      'sexual': 'contenu sexuel',
      'hate': 'discours de haine',
      'harassment': 'harcèlement',
      'self-harm': 'automutilation',
      'sexual/minors': 'contenu sexuel impliquant des mineurs',
      'hate/threatening': 'menaces haineuses',
      'violence/graphic': 'violence graphique',
      'self-harm/intent': 'intention d\'automutilation',
      'self-harm/instructions': 'instructions d\'automutilation',
      'harassment/threatening': 'harcèlement avec menaces',
      'violence': 'violence',
    };
    
    return translations[category] || category;
  }

  /**
   * Crée un résultat "sûr" par défaut
   */
  private createSafeResult(processingTime: number): ModerationResult {
    return {
      isFlagged: false,
      confidence: 0,
      categories: {
        toxic: false,
        spam: false,
        harassment: false,
        hateSpeech: false,
        sexualContent: false,
        violence: false,
        selfHarm: false,
      },
      scores: {
        toxicity: 0,
        spam: 0,
        harassment: 0,
        hateSpeech: 0,
        sexualContent: 0,
        violence: 0,
        selfHarm: 0,
      },
      action: 'approve',
      explanation: 'Contenu vide ou invalide',
      processingTimeMs: Math.round(processingTime),
      provider: 'custom'
    };
  }
}

// Instance singleton
export const aiModerationService = new AIModerationService();

// Hook React pour utiliser la modération IA
export const useAIModeration = () => {
  const moderateContent = async (content: string, contentType?: string) => {
    return aiModerationService.moderateContent(content, contentType);
  };

  return {
    moderateContent,
  };
};
