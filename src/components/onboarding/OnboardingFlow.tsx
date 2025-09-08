import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks/useTranslation';

const steps = [
  'welcome',
  'profile-setup',
  'preferences',
  'photo-upload',
  'notifications',
  'complete'
];

export const OnboardingFlow = ({ onComplete }: { onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useTranslation('onboarding');
  
  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Définissez la fonction renderStep :
  const renderStep = (step: any) => {
    // Logique de rendu du step
    return <div>{step.content}</div>;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-heart-red/10 to-heart-green/10">
      <div className="w-full max-w-md">
        <Progress value={progress} className="mb-8" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep(steps[currentStep])}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            {t('previous')}
          </Button>
          
          <Button onClick={nextStep}>
            {currentStep === steps.length - 1 ? t('finish') : t('next')}
          </Button>
        </div>
      </div>
    </div>
  );
};
