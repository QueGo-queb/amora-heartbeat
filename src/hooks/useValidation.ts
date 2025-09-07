// Nouveau fichier: src/hooks/useValidation.ts
import { useState } from 'react';
import { z } from 'zod';
import { useAnalytics } from '@/utils/analytics';

interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: Record<string, string>;
  fieldErrors: Record<string, string[]>;
}

export const useValidation = <T>(schema: z.ZodSchema<T>) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const { trackError } = useAnalytics();

  const validate = (data: unknown): ValidationResult<T> => {
    try {
      const result = schema.safeParse(data);
      
      if (result.success) {
        setErrors({});
        setFieldErrors({});
        return {
          isValid: true,
          data: result.data,
          errors: {},
          fieldErrors: {}
        };
      } else {
        const newErrors: Record<string, string> = {};
        const newFieldErrors: Record<string, string[]> = {};

        result.error.issues.forEach(issue => {
          const path = issue.path.join('.');
          const message = issue.message;
          
          newErrors[path] = message;
          
          if (!newFieldErrors[path]) {
            newFieldErrors[path] = [];
          }
          newFieldErrors[path].push(message);
        });

        setErrors(newErrors);
        setFieldErrors(newFieldErrors);

        // Tracker les erreurs de validation
        trackError(new Error('Validation failed'), 'form_validation');

        return {
          isValid: false,
          errors: newErrors,
          fieldErrors: newFieldErrors
        };
      }
    } catch (error) {
      trackError(error as Error, 'validation_exception');
      return {
        isValid: false,
        errors: { general: 'Erreur de validation inattendue' },
        fieldErrors: {}
      };
    }
  };

  const clearErrors = () => {
    setErrors({});
    setFieldErrors({});
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return errors[fieldName];
  };

  const hasFieldError = (fieldName: string): boolean => {
    return !!errors[fieldName];
  };

  return {
    validate,
    errors,
    fieldErrors,
    clearErrors,
    getFieldError,
    hasFieldError
  };
};