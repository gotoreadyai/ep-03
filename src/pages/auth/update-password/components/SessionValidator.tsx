// ============================================
// src/pages/auth/update-password/components/SessionValidator.tsx
// ============================================

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";

interface SessionValidatorProps {
  isChecking: boolean;
  isValid?: boolean;
  error?: string;
}

export const SessionValidator: React.FC<SessionValidatorProps> = ({
  isChecking,
  isValid,
  error
}) => {
  if (isChecking) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Weryfikacja sesji...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isValid) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Nieprawidłowa lub wygasła sesja.</strong>
              <br />
              {error || "Link do resetowania hasła mógł wygasnąć."}
              <br />
              <span className="text-sm">Za chwilę zostaniesz przekierowany...</span>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return null;
};