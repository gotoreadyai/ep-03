// ============================================
// src/pages/auth/forgot-password/components/ForgotPasswordForm.tsx
// ============================================

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, AlertTriangle, Info, ArrowLeft } from 'lucide-react';
import type { ForgotPasswordLogic } from '../types';

export const ForgotPasswordForm: React.FC<ForgotPasswordLogic> = ({
  email,
  setEmail,
  isLoading,
  error,
  handleSubmit
}) => {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Resetuj hasło</CardTitle>
        <CardDescription className="text-center">
          Wprowadź swój email, aby otrzymać link do resetowania hasła
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="przykład@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              autoFocus
            />
          </div>

          {/* Informacja pomocnicza */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Jak to działa?</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Wyślemy Ci email z linkiem do resetowania hasła</li>
                <li>Link będzie ważny przez 1 godzinę</li>
                <li>Po kliknięciu będziesz mógł ustawić nowe hasło</li>
              </ol>
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !email.trim()}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Wysyłanie...' : 'Wyślij link resetujący'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a 
            href="/login" 
            className="text-sm text-blue-600 hover:text-blue-500 inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Powrót do logowania
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
