import { createContext, useContext } from 'react';

type OnboardingContextType = {
  restartOnboarding: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error(
      'useOnboarding must be used inside OnboardingContext.Provider',
    );
  }

  return context;
}

export default OnboardingContext;
