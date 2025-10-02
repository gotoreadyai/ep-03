// src/pages/admin/permissions/components/GroupsInfoCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Users, FolderOpen, ArrowRight } from "lucide-react";

export const GroupsInfoCard = () => {
  return (
    <Card className="border-primary/20 bg-primary/5 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="grid grid-cols-[auto_1fr] gap-4">
          {/* Left: Icon + Title */}
          <div className="flex flex-col items-center gap-2 pr-4 border-r border-primary/20">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-primary uppercase tracking-wide">Grupy</p>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-1">
                Co to jest grupa?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Grupa = kontener na uczniów (np. "Klasa 1A"). Sama grupa <strong>NIE DAJE</strong> dostępu do żadnych kursów.
              </p>
            </div>

            {/* What it does */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Organizujesz uczniów w logiczne klasy/zespoły</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Możesz dodawać i usuwać uczniów z grupy</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Grupa służy tylko do organizacji</span>
              </div>
            </div>

            {/* Next step */}
            <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-md border border-primary/20">
              <FolderOpen className="w-4 h-4 text-primary flex-shrink-0" />
              <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Aby dać dostęp do kursów → użyj modułu <strong>"Kursy dla grup"</strong>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};