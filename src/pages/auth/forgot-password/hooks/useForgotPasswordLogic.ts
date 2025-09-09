//src/pages/auth/forgot-password/hooks/useForgotPasswordLogic.ts
import React from 'react';
import { forgotPasswordService } from '../services/forgotPasswordService';
import { validateForgotPasswordEmail } from '../utils/forgotPasswordValidation';
import type { ForgotPasswordLogic } from '../types';

export const useForgotPasswordLogic = (): ForgotPasswordLogic => {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validateForgotPasswordEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);
    const result = await forgotPasswordService.sendResetEmail(email);
    setIsLoading(false);
    
    if (result.success) {
      setIsSuccess(true);
    } else {
      setError(result.error);
    }
  };

  return {
    email,
    setEmail,
    isLoading,
    error,
    isSuccess,
    handleSubmit
  };
};