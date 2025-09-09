// /src/pages/auth/update-password/hooks/useUpdatePasswordLogic.ts
import React from "react";
import { useNavigate } from "react-router-dom";
import { updatePasswordService } from "../services/updatePasswordService";
import { validateUpdatePassword } from "../utils/updatePasswordValidation";
import type { UpdatePasswordLogic } from "../types";

export const useUpdatePasswordLogic = (): UpdatePasswordLogic => {
  const navigate = useNavigate();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateUpdatePassword(password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    const result = await updatePasswordService.updatePassword(password);
    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => navigate("/login?passwordChanged=true"), 3000);
    } else {
      setError(result.error);
    }
  };

  return {
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    isLoading,
    error,
    isSuccess,
    handleSubmit,
  };
};