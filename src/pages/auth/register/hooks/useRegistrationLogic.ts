//src/pages/auth/register/hooks/useRegistrationLogic.ts
import React from "react";
import { useNavigate } from "react-router-dom";
import { registerService } from "../services/registerService";
import { validateEmail, validateName, validatePassword } from "../utils/registrationValidation";
import type { RegistrationStore, RegistrationLogic } from "../types";

export const useRegistrationLogic = (store: RegistrationStore): RegistrationLogic => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submitStep1 = async (data: { email: string; name: string }): Promise<boolean> => {
    setError(null);
    
    const emailError = validateEmail(data.email);
    if (emailError) {
      setError(emailError);
      return false;
    }
    
    const nameError = validateName(data.name);
    if (nameError) {
      setError(nameError);
      return false;
    }
    
    store.setData(data);
    store.nextStep();
    navigate("/register/step2");
    return true;
  };

  const submitStep2 = async (data: { password: string; confirmPassword: string }): Promise<boolean> => {
    setError(null);
    
    const passwordError = validatePassword(data.password);
    if (passwordError) {
      setError(passwordError);
      return false;
    }
    
    if (data.password !== data.confirmPassword) {
      setError("Hasła nie są identyczne");
      return false;
    }
    
    store.setData(data);
    store.nextStep();
    navigate("/register/step3");
    return true;
  };

  const submitRegistration = async (): Promise<boolean> => {
    setError(null);
    setIsSubmitting(true);

    if (!store.data.email || !store.data.password || !store.data.name) {
      setError("Brak wymaganych danych. Rozpocznij proces od początku.");
      setIsSubmitting(false);
      return false;
    }

    const result = await registerService.register(
      store.data.email,
      store.data.password,
      store.data.name
    );

    setIsSubmitting(false);

    if (result.success) {
      store.setData({ registrationComplete: true });
      store.nextStep();
      navigate("/register/step4");
      return true;
    } else {
      setError(result.error);
      return false;
    }
  };

  return {
    isSubmitting,
    error,
    submitStep1,
    submitStep2,
    submitRegistration
  };
};