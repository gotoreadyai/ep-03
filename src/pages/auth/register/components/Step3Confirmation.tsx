// ============================================
// src/pages/auth/register/components/Step3Confirmation.tsx
// ============================================

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserCheck, AlertTriangle, ArrowLeft, Loader2, Check, Mail, User } from "lucide-react";
import { Lead } from "@/components/reader";
import type { RegistrationStore, RegistrationLogic } from "../types";

interface Step3Props {
  store: RegistrationStore;
  logic: RegistrationLogic;
}

export const Step3Confirmation: React.FC<Step3Props> = ({ store, logic }) => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleRegister = async () => {
    const success = await logic.submitRegistration();
    if (success) {
      setIsSuccess(true);
    }
  };

  if (!store.data.email) {
    return (
      <>
        <Lead title="Rejestracja" description="Błąd - brak danych" />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Brak danych rejestracji. Rozpocznij proces od początku.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/register/step1")} className="mt-4">
          Wróć do kroku 1
        </Button>
      </>
    );
  }

  return (
    <>
      <div className="flex items-start gap-5 mb-6">
        <UserCheck className="mt-2 bg-white rounded-full p-2 w-12 h-12" />
        <Lead title="Rejestracja" description="Krok 3 z 4 - Potwierdzenie danych" />
      </div>

      {isSuccess && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Rejestracja udana!</strong> Za chwilę zostaniesz przekierowany...
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Check className="mr-2 h-5 w-5 text-blue-600" />
            Podsumowanie
          </CardTitle>
          <CardDescription>
            Sprawdź czy wszystkie dane są poprawne
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{store.data.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Imię i nazwisko</p>
                <p className="text-sm text-gray-600">{store.data.name}</p>
              </div>
            </div>
          </div>

          {logic.error && !isSuccess && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Rejestracja nieudana:</strong> {logic.error}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/register/step2")} 
              disabled={logic.isSubmitting || isSuccess}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Wstecz
            </Button>

            <Button 
              onClick={handleRegister} 
              disabled={logic.isSubmitting || isSuccess}
            >
              {logic.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {logic.isSubmitting ? "Rejestruję..." : 
               isSuccess ? "Udane!" :
               logic.error ? "Spróbuj ponownie" : "Zarejestruj się"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};