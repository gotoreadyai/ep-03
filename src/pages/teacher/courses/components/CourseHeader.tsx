interface Course {
    id?: number;
    title?: string;
    description?: string;
    icon_emoji?: string;
  }
  
  interface CourseHeaderProps {
    course: Course | undefined;
  }
  
  export const CourseHeader = ({ course }: CourseHeaderProps) => {
    if (!course) return null;
  
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {course.icon_emoji && (
            <span className="text-5xl">{course.icon_emoji}</span>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            {course.description && (
              <p className="mt-2 text-lg text-muted-foreground whitespace-pre-wrap">
                {course.description}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };