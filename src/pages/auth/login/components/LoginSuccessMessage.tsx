// ============================================
// src/pages/auth/login/components/LoginSuccessMessage.tsx
// ============================================

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

interface LoginSuccessMessageProps {
  title: string;
  message: string;
}

export const LoginSuccessMessage: React.FC<LoginSuccessMessageProps> = ({ title, message }) => (
  <Alert className="mb-4 border-green-200 bg-green-50">
    <CheckCircle className="h-4 w-4 text-green-600" />
    <AlertDescription className="text-green-800">
      <strong>{title}</strong> {message}
    </AlertDescription>
  </Alert>
);
