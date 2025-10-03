import { User, BookOpen, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StudentHeaderProps {
  student: {
    id: string;
    full_name: string;
    email: string;
  };
  course: {
    id: number;
    title: string;
    icon_emoji?: string;
  };
  group: {
    id: number;
    name: string;
    academic_year: string;
  };
  progressPercentage: number;
}

export const StudentHeader = ({
  student,
  course,
  group,
  progressPercentage,
}: StudentHeaderProps) => {
  const getStatusBadge = () => {
    if (progressPercentage === 100) {
      return (
        <Badge className="bg-green-600 hover:bg-green-700">
          Ukończono kurs
        </Badge>
      );
    }
    if (progressPercentage > 0) {
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700">
          W trakcie nauki
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        Nierozpoczęty
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-6">
        <div className="h-40 w-40 rounded-full bg-muted  flex items-center justify-center flex-shrink-0">
          <User className="h-20 w-20 text-primary" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {student.full_name}
              </h1>
              <p className="text-muted-foreground mt-1">{student.email}</p>
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            {course.icon_emoji && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xl">{course.icon_emoji}</span>
                <span className="font-medium">{course.title}</span>
              </div>
            )}
            {!course.icon_emoji && (
              <Badge variant="outline" className="gap-1">
                <BookOpen className="w-3 h-3" />
                {course.title}
              </Badge>
            )}
            <Badge variant="outline" className="gap-1">
              <Users className="w-3 h-3" />
              {group.name}
            </Badge>
            <Badge variant="outline">
              {group.academic_year}
            </Badge>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Postęp w kursie</span>
              <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};