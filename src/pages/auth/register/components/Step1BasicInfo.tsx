// ============================================
// src/pages/auth/register/components/Step1BasicInfo.tsx
// ============================================

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, AlertTriangle, ArrowRight } from "lucide-react";
import { Lead } from "@/components/reader";
import type { RegistrationStore, RegistrationLogic } from "../types";

interface Step1Props {
  store: RegistrationStore;
  logic: RegistrationLogic;
}

export const Step1BasicInfo: React.FC<Step1Props> = ({ store, logic }) => {
  const [email, setEmail] = React.useState(store.data.email || "");
  const [name, setName] = React.useState(store.data.name || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await logic.submitStep1({ email, name });
  };

  return (
    <>
      <div className="flex items-start gap-5 mb-6">
        <UserPlus className="mt-2 bg-white rounded-full p-2 w-12 h-12" />
        <Lead
          title="Rejestracja"
          description="Krok 1 z 4 - Podaj podstawowe informacje"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dane podstawowe</CardTitle>
          <CardDescription>
            Potrzebujemy kilku podstawowych informacji do założenia konta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="przykład@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Imię i nazwisko
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Jan Kowalski"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {logic.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{logic.error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Dalej
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <a href="/login" className="text-blue-600 hover:text-blue-500">
              Masz już konto? Zaloguj się
            </a>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
