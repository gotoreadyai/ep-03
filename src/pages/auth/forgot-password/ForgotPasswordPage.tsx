// ============================================
// src/pages/auth/forgot-password/ForgotPasswordPage.tsx
// GŁÓWNY KOMPONENT STRONY (lazy loaded)
// ============================================

import React from 'react';
import { useForgotPassword } from '@refinedev/core';
import { ForgotPasswordLayout } from './components/ForgotPasswordLayout';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';
import { EmailSentSuccess } from './components/EmailSentSuccess';
import { useForgotPasswordLogic } from './hooks/useForgotPasswordLogic';

const ForgotPasswordPage: React.FC = () => {
  const logic = useForgotPasswordLogic();

  if (logic.isSuccess) {
    return (
      <ForgotPasswordLayout>
        <EmailSentSuccess email={logic.email} />
      </ForgotPasswordLayout>
    );
  }

  return (
    <ForgotPasswordLayout>
      <ForgotPasswordForm {...logic} />
    </ForgotPasswordLayout>
  );
};

export default ForgotPasswordPage;