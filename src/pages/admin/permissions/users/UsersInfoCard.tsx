// ============================================
// src/pages/admin/permissions/users/UsersInfoCard.tsx
// ============================================
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Lightbulb, 
  Shield,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export const UsersInfoCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex-shrink-0">
            <Lightbulb className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Jak zarządzać użytkownikami?
                <Sparkles className="h-4 w-4 text-purple-500" />
              </h3>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-purple-600 dark:text-purple-400"
                aria-label={isExpanded ? "Zwiń szczegóły" : "Rozwiń szczegóły"}
              >
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              System pozwala na łatwe zarządzanie rolami i statusami użytkowników.
            </p>
            
            {isExpanded && (
              <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-sm font-bold text-purple-600 flex-shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">Znajdź użytkownika</p>
                      <p className="text-xs text-muted-foreground">
                        Użyj wyszukiwarki lub filtrów, aby znaleźć konkretnego użytkownika
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-sm font-bold text-purple-600 flex-shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">Zmień rolę</p>
                      <p className="text-xs text-muted-foreground">
                        Wybierz nową rolę z rozwijanej listy: Uczeń, Nauczyciel lub Administrator
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-sm font-bold text-purple-600 flex-shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">Zarządzaj statusem</p>
                      <p className="text-xs text-muted-foreground">
                        Użyj przełącznika, aby aktywować lub dezaktywować konto użytkownika
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <p className="text-xs text-purple-700 dark:text-purple-300 flex items-start gap-2">
                    <Shield className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Wskazówka:</strong> Administratorzy mają pełen dostęp do systemu. 
                      Przyznawaj tę rolę z rozwagą.
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