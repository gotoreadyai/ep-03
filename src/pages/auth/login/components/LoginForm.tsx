// ============================================
// src/pages/auth/login/components/LoginForm.tsx
// ============================================

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Lock } from "lucide-react";
import { Form, FormActions, FormControl } from "@/components/form";

import type { LoginFormProps } from "../types";
import { LoginSuccessMessage } from "./LoginSuccessMessage";
import { LoginErrorMessage } from "./LoginErrorMessage";

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  setEmail,
  setPassword,
  isLoading,
  error,
  handleSubmit,
  isFormValid,
  showVerifiedMessage,
  showPasswordChangedMessage
}) => {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Zaloguj się</CardTitle>
        <CardDescription className="text-center">
          Wprowadź swoje dane aby się zalogować
        </CardDescription>
      </CardHeader>

      <CardContent>
        {showVerifiedMessage && (
          <LoginSuccessMessage 
            title="Email potwierdzony!" 
            message="Możesz się teraz zalogować." 
          />
        )}

        {showPasswordChangedMessage && (
          <LoginSuccessMessage 
            title="Hasło zmienione!" 
            message="Możesz się zalogować używając nowego hasła." 
          />
        )}

        <Form onSubmit={handleSubmit}>
          <FormControl
            label={
              <span className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </span>
            }
            htmlFor="email"
            error={error?.toLowerCase().includes("email") ? "Sprawdź poprawność adresu email" : undefined}
            required
          >
            <Input
              id="email"
              type="email"
              placeholder="przykład@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className={error?.toLowerCase().includes("email") ? "border-red-500" : ""}
            />
          </FormControl>

          <FormControl
            label={
              <span className="flex items-center">
                <Lock className="mr-2 h-4 w-4" />
                Hasło
              </span>
            }
            htmlFor="password"
            error={error?.toLowerCase().includes("hasło") ? "Sprawdź poprawność hasła" : undefined}
            required
          >
            <Input
              id="password"
              type="password"
              placeholder="Wprowadź hasło"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className={error?.toLowerCase().includes("hasło") ? "border-red-500" : ""}
            />
          </FormControl>

          {error && <LoginErrorMessage error={error} />}

          <FormActions className="!border-0 !pt-0 justify-center">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isFormValid}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Logowanie..." : "Zaloguj się"}
            </Button>
          </FormActions>
        </Form>

        <div className="mt-6 space-y-3">
          <div className="text-center text-sm">
            <Link
              to="/register/step1"
              className="text-blue-600 hover:text-blue-500 transition-colors"
            >
              Nie masz konta? Zarejestruj się
            </Link>
          </div>

          <div className="text-center text-sm">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:text-blue-500 transition-colors"
            >
              Zapomniałeś hasła?
            </Link>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="text-center text-xs text-gray-500">
              <p>Problemy z logowaniem?</p>
              <Link
                to="/contact"
                className="text-blue-600 hover:text-blue-500 transition-colors"
              >
                Skontaktuj się z pomocą techniczną
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
