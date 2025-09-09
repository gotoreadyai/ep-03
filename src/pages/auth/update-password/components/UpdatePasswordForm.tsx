// ============================================
// src/pages/auth/update-password/components/UpdatePasswordForm.tsx
// ============================================

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Key, AlertTriangle, Info, ArrowLeft } from "lucide-react";
import { PasswordRequirements } from "./PasswordRequirements";
import type { UpdatePasswordLogic } from "../types";

export const UpdatePasswordForm: React.FC<UpdatePasswordLogic> = ({
  password,
  confirmPassword,
  setPassword,
  setConfirmPassword,
  isLoading,
  error,
  handleSubmit
}) => {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
          <Key className="h-6 w-6" />
          Nowe hasło
        </CardTitle>
        <CardDescription className="text-center">
          Wprowadź nowe hasło dla swojego konta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nowe hasło</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 6 znaków"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Powtórz nowe hasło"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Wymagania hasła */}
          <PasswordRequirements password={password} />

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Aktualizowanie..." : "Zaktualizuj hasło"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Pamiętasz hasło?{" "}
            <a href="/login" className="text-blue-600 hover:text-blue-500">
              Wróć do logowania
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};