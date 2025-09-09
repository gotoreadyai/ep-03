// ============================================
// src/pages/auth/update-password/UpdatePasswordPage.tsx
// GŁÓWNY KOMPONENT STRONY (lazy loaded)
// ============================================

import React from "react";
import { useUpdatePassword } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { UpdatePasswordLayout } from "./components/UpdatePasswordLayout";
import { UpdatePasswordForm } from "./components/UpdatePasswordForm";
import { SessionValidator } from "./components/SessionValidator";
import { UpdateSuccess } from "./components/UpdateSuccess";
import { useUpdatePasswordLogic } from "./hooks/useUpdatePasswordLogic";
import { useSessionValidation } from "./hooks/useSessionValidation";

const UpdatePasswordPage: React.FC = () => {
  const sessionValidation = useSessionValidation();
  const updateLogic = useUpdatePasswordLogic();

  // Sprawdzanie sesji
  if (sessionValidation.isChecking) {
    return (
      <UpdatePasswordLayout>
        <SessionValidator isChecking={true} />
      </UpdatePasswordLayout>
    );
  }

  // Błędna sesja
  if (!sessionValidation.isValid) {
    return (
      <UpdatePasswordLayout>
        <SessionValidator 
          isChecking={false} 
          isValid={false} 
          error={sessionValidation.error}
        />
      </UpdatePasswordLayout>
    );
  }

  // Sukces aktualizacji
  if (updateLogic.isSuccess) {
    return (
      <UpdatePasswordLayout>
        <UpdateSuccess />
      </UpdatePasswordLayout>
    );
  }

  // Formularz aktualizacji
  return (
    <UpdatePasswordLayout>
      <UpdatePasswordForm {...updateLogic} />
    </UpdatePasswordLayout>
  );
};

export default UpdatePasswordPage;