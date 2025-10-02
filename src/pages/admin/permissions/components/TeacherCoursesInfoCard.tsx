// src/pages/admin/permissions/components/TeacherCoursesInfoCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { UserCog, Edit3, BarChart3, AlertTriangle } from "lucide-react";

export const TeacherCoursesInfoCard = () => {
  return (
    <Card className="border-accent/20 bg-accent/5 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="grid grid-cols-[auto_1fr] gap-4">
          {/* Left: Icon + Title */}
          <div className="flex flex-col items-center gap-2 pr-4 border-r border-accent/20">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shadow-sm">
              <UserCog className="w-6 h-6 text-accent-foreground" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-accent uppercase tracking-wide">Kurs</p>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-1">
                Nadaj uprawnienia do edycji kursu
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Przypisujesz nauczyciela → Może edytować kurs i oglądać postępy grup
              </p>
            </div>

            {/* What teacher can do */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Edit3 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                <span>Edytuje strukturę i zawartość kursu</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Edit3 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                <span>Dodaje materiały, quizy, zadania</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <BarChart3 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                <span>Monitoruje postępy uczniów i grup</span>
              </div>
            </div>

            {/* Example */}
            <div className="px-3 py-2 bg-background rounded-md border border-accent/20">
              <p className="text-xs text-foreground">
                <strong>Przykład:</strong> Jan Kowalski → Matematyka → może edytować ten kurs
              </p>
            </div>

            {/* Critical warning */}
            <div className="flex items-start gap-2 px-3 py-2 bg-destructive/10 rounded-md border border-destructive/20">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-xs text-foreground leading-relaxed">
                <strong>WAŻNE:</strong> To NIE daje dostępu uczniom! Uczniowie dostaną dostęp tylko przez moduł <strong>"Kursy dla grup"</strong>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};