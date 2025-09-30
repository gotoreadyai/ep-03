import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar } from "lucide-react";

interface GroupAccessCardProps {
  group: {
    id: number;
    name: string;
    academic_year: string;
    is_active: boolean;
  };
  membersCount: number;
}

export const GroupAccessCard = ({ group, membersCount }: GroupAccessCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-base mb-1">{group.name}</h4>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {group.academic_year}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {membersCount} {membersCount === 1 ? 'uczeń' : membersCount > 1 && membersCount < 5 ? 'uczniów' : 'uczniów'}
              </span>
            </div>
          </div>
          <Badge variant={group.is_active ? "default" : "secondary"}>
            {group.is_active ? "Aktywna" : "Nieaktywna"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};