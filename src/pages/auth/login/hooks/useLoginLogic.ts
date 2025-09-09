// /src/pages/auth/login/hooks/useLoginLogic.ts
import React from "react";
import { useNavigate } from "react-router-dom";
import { loginService } from "../services/loginService";

export const useLoginLogic = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError("Wypełnij wszystkie pola");
      return;
    }

    setError(null);
    setIsLoading(true);

    const result = await loginService.login(email, password);
    
    setIsLoading(false);
    
    if (result.success) {
      navigate(result.redirectTo || '/');
    } else {
      setError(result.error);
    }
  };

  return {
    email,
    password,
    setEmail,
    setPassword,
    isLoading,
    error,
    handleSubmit,
    isFormValid: email.trim().length > 0 && password.length > 0
  };
};