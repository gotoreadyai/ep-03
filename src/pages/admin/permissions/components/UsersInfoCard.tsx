// src/pages/admin/permissions/components/UsersInfoCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Shield, GraduationCap, UserCog, Users } from "lucide-react";

export const UsersInfoCard = () => {
  return (
    <Card className="border-purple/20 bg-purple/5 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="grid grid-cols-[auto_1fr] gap-4">
          {/* Left: Icon + Title */}
          <div className="flex flex-col items-center gap-2 pr-4 border-r border-purple/20">
            <div className="w-12 h-12 rounded-xl bg-purple flex items-center justify-center shadow-sm">
              <Shield className="w-6 h-6 text-purple-foreground" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-purple uppercase tracking-wide">Role</p>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-1">
                Zarządzaj rolami użytkowników
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Zmiana roli określa uprawnienia użytkownika w systemie
              </p>
            </div>

            {/* Roles explanation */}
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs">
                <GraduationCap className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Uczeń</strong> → może się uczyć z kursów (gdy dostanie dostęp przez grupy)
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <UserCog className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Nauczyciel</strong> → może edytować kursy (gdy zostanie przypisany)
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <Shield className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Administrator</strong> → pełne uprawnienia do zarządzania systemem
                </div>
              </div>
            </div>

            {/* What it does */}
            <div className="px-3 py-2 bg-background rounded-md border border-purple/20">
              <p className="text-xs text-foreground">
                <strong>Co to robi?</strong> Zmiana roli → użytkownik dostaje nowe uprawnienia w systemie
              </p>
            </div>

            {/* Important note */}
            <div className="px-3 py-2 bg-orange/10 rounded-md border border-orange/20">
              <p className="text-xs text-foreground leading-relaxed">
                <strong>Ważne:</strong> Sama zmiana roli NIE przypisuje kursów ani grup - to robisz w innych modułach
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};