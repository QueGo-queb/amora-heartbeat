/**
 * ✅ SYSTÈME DE VALIDATION SÉCURISÉ
 */

import { z } from 'zod';

// Schémas de validation
export const validationSchemas = {
  // Validation utilisateur
  user: z.object({
    email: z.string().email('Email invalide').max(255),
    password: z.string().min(8, 'Mot de passe trop court').max(128),
    full_name: z.string().min(2, 'Nom trop court').max(100).regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Caractères invalides'),
    age: z.number().min(18, 'Âge minimum 18 ans').max(100, 'Âge maximum 100 ans'),
    bio: z.string().max(500, 'Bio trop longue').optional(),
    location: z.string().max(100).optional(),
    interests: z.array(z.string()).max(20, 'Trop d\'intérêts').optional()
  }),

  // Validation post
  post: z.object({
    content: z.string().min(1, 'Contenu requis').max(2000, 'Contenu trop long'),
    tags: z.array(z.string()).max(10, 'Trop de tags').optional(),
    visibility: z.enum(['public', 'friends', 'private']).default('public')
  }),

  // Validation message
  message: z.object({
    content: z.string().min(1, 'Message requis').max(1000, 'Message trop long'),
    receiver_id: z.string().uuid('ID invalide')
  })
};

// Fonction de validation sécurisée
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} => {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return {
        success: false,
        errors: result.error.errors.map(err => err.message)
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: ['Erreur de validation']
    };
  }
};

// Sanitisation des entrées
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Supprimer les balises HTML
    .replace(/javascript:/gi, '') // Supprimer les scripts
    .replace(/on\w+=/gi, '') // Supprimer les événements
    .substring(0, 1000); // Limiter la longueur
};

// Validation des fichiers uploadés
export const validateFile = (file: File): {
  valid: boolean;
  error?: string;
} => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Fichier trop volumineux (max 10MB)' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Type de fichier non autorisé' };
  }
  
  return { valid: true };
};
