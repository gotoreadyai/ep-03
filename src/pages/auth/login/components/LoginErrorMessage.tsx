// ============================================
// src/pages/auth/login/components/LoginErrorMessage.tsx
// ============================================

import React from "react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";

interface LoginErrorMessageProps {
  error: string;
}

export const LoginErrorMessage: React.FC<LoginErrorMessageProps> = ({ error }) => {
  const getErrorVariant = () => {
    if (error.includes("nie został potwierdzony")) {
      return "warning";
    }
    return "destructive";
  };

  const getErrorIcon = () => {
    if (error.includes("nie został potwierdzony")) {
      return Info;
    }
    return AlertTriangle;
  };

  return (
    <Alert variant={getErrorVariant() as any}>
      {React.createElement(getErrorIcon(), { className: "h-4 w-4" })}
      <AlertDescription>
        <strong>Błąd logowania:</strong> {error}
        
        {error.includes("nie został potwierdzony") && (
          <div className="mt-2 text-sm">
            <p>💡 <strong>Co robić:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Sprawdź swoją skrzynkę email (także spam)</li>
              <li>Kliknij link aktywacyjny w emailu</li>
              <li>
                Jeśli nie otrzymałeś emaila, możesz{" "}
                <Link to="/resend-confirmation" className="underline">
                  wysłać ponownie
                </Link>
              </li>
            </ul>
          </div>
        )}
        
        {error.includes("Nieprawidłowe dane") && (
          <div className="mt-2 text-sm">
            <p>💡 <strong>Sprawdź:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Czy email jest wpisany poprawnie</li>
              <li>Czy hasło jest poprawne (uwaga na wielkość liter)</li>
              <li>Czy masz już założone konto</li>
            </ul>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};