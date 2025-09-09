// ============================================
// src/pages/auth/forgot-password/components/EmailSentSuccess.tsx
// ============================================

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, RefreshCw, ArrowLeft, Clock } from 'lucide-react';

interface EmailSentSuccessProps {
  email: string;
}

export const EmailSentSuccess: React.FC<EmailSentSuccessProps> = ({ email }) => {
  const [resendDisabled, setResendDisabled] = React.useState(true);
  const [countdown, setCountdown] = React.useState(60);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResend = () => {
    // Tu można dodać logikę ponownego wysyłania
    setResendDisabled(true);
    setCountdown(60);
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
          <CheckCircle className="h-6 w-6 text-green-500" />
          Email wysłany
        </CardTitle>
        <CardDescription className="text-center">
          Sprawdź swoją skrzynkę odbiorczą
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-green-200 bg-green-50">
          <Mail className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Wysłaliśmy link do resetowania hasła na adres:
            <strong className="block mt-1">{email}</strong>
          </AlertDescription>
        </Alert>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start">
            <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <p>Link będzie aktywny przez <strong>1 godzinę</strong></p>
          </div>
          
          <div className="border-t pt-3">
            <p className="font-medium mb-2">Nie widzisz emaila?</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Sprawdź folder spam lub "Oferty"</li>
              <li>Upewnij się, że email został wpisany poprawnie</li>
              <li>Poczekaj kilka minut - email może przyjść z opóźnieniem</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={resendDisabled}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {resendDisabled 
              ? `Wyślij ponownie (${countdown}s)` 
              : 'Wyślij ponownie'
            }
          </Button>
          
          <div className="text-center">
            <a 
              href="/login" 
              className="text-sm text-blue-600 hover:text-blue-500 inline-flex items-center"
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Powrót do logowania
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};