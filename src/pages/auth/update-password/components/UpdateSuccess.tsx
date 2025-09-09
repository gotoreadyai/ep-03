// ============================================
// src/pages/auth/update-password/components/UpdateSuccess.tsx
// ============================================

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, ArrowRight } from "lucide-react";

export const UpdateSuccess: React.FC = () => {
  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
          <CheckCircle className="h-6 w-6 text-green-600" />
          Hasło zmienione!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Twoje hasło zostało pomyślnie zmienione. 
            <br />
            Za chwilę zostaniesz przekierowany do strony logowania...
          </AlertDescription>
        </Alert>
        
        <div className="mt-6 text-center">
          <a 
            href="/login" 
            className="text-blue-600 hover:text-blue-500 inline-flex items-center"
          >
            Przejdź do logowania
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
