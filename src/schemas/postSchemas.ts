// Nouveau fichier: src/schemas/postSchemas.ts
import { z } from 'zod';

// Schéma pour la validation des numéros de téléphone
const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;

// Schéma pour la validation des URLs
const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Schéma pour les liens externes
export const externalLinkSchema = z.object({
  url: z.string().regex(urlRegex, 'URL invalide'),
  title: z.string().min(1, 'Titre requis').max(100, 'Titre trop long'),
  description: z.string().max(200, 'Description trop longue').optional()
});

// Schéma pour la création de post
export const createPostSchema = z.object({
  content: z.string()
    .min(1, 'Le contenu ne peut pas être vide')
    .max(5000, 'Le contenu ne peut pas dépasser 5000 caractères')
    .refine(
      (content) => {
        // Validation pour utilisateurs gratuits - pas de liens ou téléphones
        const hasPhone = phoneRegex.test(content);
        const hasUrl = urlRegex.test(content);
        return { hasPhone, hasUrl, content };
      },
      { message: 'Contenu validé' }
    ),
  
  target_group: z.enum(['all', 'friends', 'premium']).default('all'),
  
  target_countries: z.array(z.string().length(2, 'Code pays invalide')).default([]),
  
  target_languages: z.array(z.string().min(2).max(5)).default([]),
  
  phone_number: z.string()
    .regex(phoneRegex, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),
  
  external_links: z.array(externalLinkSchema).max(5, 'Maximum 5 liens').default([]),
  
  media_files: z.array(z.instanceof(File))
    .max(10, 'Maximum 10 fichiers')
    .refine(
      (files) => files.every(file => file.size <= 50 * 1024 * 1024), // 50MB
      'Fichier trop volumineux (max 50MB)'
    )
    .refine(
      (files) => files.every(file => 
        file.type.startsWith('image/') || file.type.startsWith('video/')
      ),
      'Seuls les images et vidéos sont autorisées'
    )
    .default([])
});

// Schéma pour la validation selon le plan utilisateur
export const validatePostForPlan = (data: any, userPlan: 'free' | 'premium') => {
  const baseValidation = createPostSchema.safeParse(data);
  
  if (!baseValidation.success) {
    return baseValidation;
  }

  const validatedData = baseValidation.data;

  // Validations spécifiques pour les utilisateurs gratuits
  if (userPlan === 'free') {
    const errors: string[] = [];

    // Vérifier le contenu pour téléphones/liens
    const contentValidation = validatedData.content;
    if (phoneRegex.test(contentValidation)) {
      errors.push('Les utilisateurs gratuits ne peuvent pas inclure de numéros de téléphone');
    }
    if (urlRegex.test(contentValidation)) {
      errors.push('Les utilisateurs gratuits ne peuvent pas inclure de liens');
    }

    // Vérifier les champs premium
    if (validatedData.phone_number) {
      errors.push('Le champ téléphone est réservé aux utilisateurs Premium');
    }
    if (validatedData.external_links.length > 0) {
      errors.push('Les liens externes sont réservés aux utilisateurs Premium');
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: {
          issues: errors.map(message => ({ message, path: ['plan_restriction'] }))
        }
      };
    }
  }

  return { success: true, data: validatedData };
};

// Types TypeScript générés
export type CreatePostData = z.infer<typeof createPostSchema>;
export type ExternalLink = z.infer<typeof externalLinkSchema>;
