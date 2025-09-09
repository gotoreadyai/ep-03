import { Card, CardContent } from "@/components/ui/card";

import { BaseKey } from "@refinedev/core";

interface Course {
  id?: BaseKey;
  title?: string;
  description?: string;
  icon_emoji?: string;
  is_published?: boolean;
  created_at?: string;
}

interface CourseOverviewProps {
  course: Course | undefined;
}

export const CourseOverview = ({ course }: CourseOverviewProps) => {
  if (!course) return null;

  return (
    <Card className="flex-1">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {course.icon_emoji && (
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-3xl">{course.icon_emoji}</span>
              </div>
            </div>
          )}
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-2xl font-semibold">{course.title}</h2>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-muted-foreground">
                  {course.is_published ? "Opublikowany" : "Szkic"}
                </span>
                {course.created_at && (
                  <span className="text-sm text-muted-foreground">
                    Utworzony: {new Date(course.created_at).toLocaleDateString('pl-PL')}
                  </span>
                )}
              </div>
            </div>
            {course.description && (
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {course.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};