// src/pages/admin/permissions/components/GroupCoursesInfoCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, CheckCircle2, AlertCircle } from "lucide-react";

export const GroupCoursesInfoCard = () => {
  return (
    <Card className="border-secondary/20 bg-secondary/5 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="grid grid-cols-[auto_1fr] gap-4">
          {/* Left: Icon + Title */}
          <div className="flex flex-col items-center gap-2 pr-4 border-r border-secondary/20">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shadow-sm">
              <BookOpen className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-secondary uppercase tracking-wide">Dostęp</p>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-1">
                Daj grupie dostęp do kursów
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Przypisujesz kurs → Wszyscy uczniowie z grupy automatycznie mogą się uczyć
              </p>
            </div>

            {/* What happens */}
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Wybierasz grupę</strong> (np. "Klasa 1A")
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Zaznaczasz kursy</strong> które mają być dostępne
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Uczniowie widzą kursy</strong> i mogą się z nich uczyć
                </div>
              </div>
            </div>

            {/* Example */}
            <div className="px-3 py-2 bg-background rounded-md border border-secondary/20">
              <p className="text-xs text-foreground">
                <strong>Przykład:</strong> Klasa 1A → Matematyka + Fizyka → Wszyscy uczniowie z 1A mają dostęp
              </p>
            </div>

            {/* Important note */}
            <div className="flex items-start gap-2 px-3 py-2 bg-orange/10 rounded-md border border-orange/20">
              <AlertCircle className="w-4 h-4 text-orange flex-shrink-0 mt-0.5" />
              <p className="text-xs text-foreground leading-relaxed">
                To NIE nadaje uprawnień nauczycielowi - tylko daje dostęp uczniom
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};