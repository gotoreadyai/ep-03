// ============================================
// src/pages/auth/register/components/Step2Password.tsx
// ============================================

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KeyRound, AlertTriangle, ArrowLeft, ArrowRight } from "lucide-react";
import { Lead } from "@/components/reader";
import type { RegistrationStore, RegistrationLogic } from "../types";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

interface Step2Props {
  store: RegistrationStore;
  logic: RegistrationLogic;
}

export const Step2Password: React.FC<Step2Props> = ({ store, logic }) => {
  const navigate = useNavigate();
  const [password, setPassword] = React.useState(store.data.password || "");
  const [confirmPassword, setConfirmPassword] = React.useState(store.data.confirmPassword || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await logic.submitStep2({ password, confirmPassword });
  };

  return (
    <>
      <div className="flex items-start gap-5 mb-6">
        <KeyRound className="mt-2 bg-white rounded-full p-2 w-12 h-12" />
        <Lead
          title="Rejestracja"
          description="Krok 2 z 4 - Ustaw hasło do konta"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utwórz hasło</CardTitle>
          <CardDescription>
            Wybierz bezpieczne hasło do swojego konta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Hasło
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 znaków"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <PasswordStrengthIndicator password={password} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Potwierdź hasło
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Powtórz hasło"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {logic.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{logic.error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate("/register/step1")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Wstecz
              </Button>
              <Button type="submit" className="flex-1">
                Dalej
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};