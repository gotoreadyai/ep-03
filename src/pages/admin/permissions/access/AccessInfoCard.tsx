// ============================================
// src/pages/admin/permissions/access/AccessInfoCard.tsx
// ============================================
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Info, 
  BookOpen,
  Users,
  UserPlus,
  Settings,
  Shield,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export const AccessInfoCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-2 border-green-200/50 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/50 flex-shrink-0">
            <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Zarządzanie dostępem do kursów
                <Settings className="h-4 w-4 text-green-500" />
              </h3>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-green-600 dark:text-green-400"
                aria-label={isExpanded ? "Zwiń szczegóły" : "Rozwiń szczegóły"}
              >
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Kontroluj, które grupy i nauczyciele mają dostęp do poszczególnych kursów.
            </p>
            
            {isExpanded && (
              <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg flex-shrink-0">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Przypisz grupy</p>
                      <p className="text-xs text-muted-foreground">
                        Wybierz grupy, które będą miały dostęp do kursu
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg flex-shrink-0">
                      <UserPlus className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Dodaj nauczycieli</p>
                      <p className="text-xs text-muted-foreground">
                        Wskaż nauczycieli prowadzących zajęcia
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg flex-shrink-0">
                      <Shield className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Kontroluj dostęp</p>
                      <p className="text-xs text-muted-foreground">
                        Zmiany są zapisywane automatycznie
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <p className="text-xs text-green-700 dark:text-green-300 flex items-start gap-2">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Ważne:</strong> Najpierw utwórz grupy w module "Grupy i klasy", 
                      a następnie przypisz je do kursów tutaj.
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
