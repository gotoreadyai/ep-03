// ============================================
// src/pages/auth/register/components/Step4Success.tsx
// ============================================

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, ArrowRight, Mail, Clock, RefreshCw } from "lucide-react";
import { Lead } from "@/components/reader";
import type { RegistrationStore } from "../types";

interface Step4Props {
  store: RegistrationStore;
}

export const Step4Success: React.FC<Step4Props> = ({ store }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Wyczyść dane po 30 sekundach
    const timer = setTimeout(() => {
      store.reset();
    }, 30000);

    return () => clearTimeout(timer);
  }, [store]);

  return (
    <>
      <Lead 
        title="Rejestracja zakończona!" 
        description="Krok 4 z 4 - Sprawdź swoją skrzynkę mailową" 
      />

      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
            Konto zostało utworzone!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 mb-4">
            Wysłaliśmy email z potwierdzeniem na adres{" "}
            <strong>{store.data.email}</strong>
          </p>
          
          <Alert className="bg-white border-green-200">
            <Mail className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong className="block mb-2">Co dalej?</strong>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Sprawdź swoją skrzynkę email (także folder spam)</li>
                <li>Kliknij link aktywacyjny w emailu</li>
                <li>Po aktywacji będziesz mógł się zalogować</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="mt-6 space-y-3">
            <Button 
              onClick={() => {
                store.reset();
                navigate("/login");
              }} 
              className="w-full"
              size="lg"
            >
              Przejdź do logowania
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                <Clock className="inline h-3 w-3 mr-1" />
                Nie otrzymałeś emaila?
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/resend-confirmation")}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Wyślij ponownie
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};