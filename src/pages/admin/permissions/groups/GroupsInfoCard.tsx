// ============================================
// src/pages/admin/permissions/groups/GroupsInfoCard.tsx
// ============================================
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Target,
  Users,
  ChevronRight,
  Zap,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export const GroupsInfoCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
            <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                System zarządzania grupami
                <Users className="h-4 w-4 text-blue-500" />
              </h3>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-blue-600 dark:text-blue-400"
                aria-label={isExpanded ? "Zwiń szczegóły" : "Rozwiń szczegóły"}
              >
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Twórz grupy i klasy, przypisuj uczniów i organizuj strukturę nauczania.
            </p>
            
            {isExpanded && (
              <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300">
                      Tworzenie grup
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Kliknij "Nowa grupa"
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Nadaj nazwę (np. "Klasa 1A")
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Określ rok akademicki
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300">
                      Zarządzanie uczniami
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Kliknij "Zarządzaj" przy grupie
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Dodaj uczniów z listy
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Usuń niepotrzebnych członków
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                    <Zap className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Pro tip:</strong> Grupy można dezaktywować bez usuwania - 
                      przydatne na koniec roku szkolnego!
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