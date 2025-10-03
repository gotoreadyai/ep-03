import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, BookOpen } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { SubPage } from "@/components/layout";
import { useNavigate } from "react-router-dom";
import { useGroupCourseActivity } from "./hooks/useGroupCourseActivity";
import { CourseProgressOverview } from "./components/CourseProgressOverview";
import { StudentProgressTable } from "./components/StudentProgressTable";
import { TopicProgressOverview } from "./components/TopicProgressOverview";

// Type definitions matching our components
interface Student {
  id: string;
  full_name: string;
  email: string;
}

interface Topic {
  id: number;
  title: string;
  position: number;
}

interface Activity {
  id: number;
  title: string;
  type: "material" | "quiz";
  topic_id: number;
}

export const GroupActivityShow = () => {
  const { groupId, courseId } = useParams();
  const navigate = useNavigate();

  const {
    group,
    course,
    students,
    topics,
    courseStats,
    isLoading,
    getStudentProgress,
    getTopicActivities,
    getActivityStats,
  } = useGroupCourseActivity(groupId!, courseId!);

  if (isLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </SubPage>
    );
  }

  if (!group || !course) {
    return (
      <SubPage>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nie znaleziono grupy lub kursu</p>
        </div>
      </SubPage>
    );
  }

  return (
    <SubPage>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/teacher/courses/show/${courseId}`)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do kursu
      </Button>

      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {course.icon_emoji && (
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-3xl">{course.icon_emoji}</span>
              </div>
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="gap-1">
                <Users className="w-3 h-3" />
                Grupa: {group.name}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <BookOpen className="w-3 h-3" />
                {group.academic_year}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <CourseProgressOverview stats={courseStats} studentsCount={students.length} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Postępy uczniów ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StudentProgressTable
            students={students as Student[]}
            getStudentProgress={getStudentProgress}
          />
        </CardContent>
      </Card>

      <TopicProgressOverview
        topics={topics as Topic[]}
        students={students as Student[]}
        getTopicActivities={(topicId: number) => getTopicActivities(topicId) as Activity[]}
        getActivityStats={getActivityStats}
      />
    </SubPage>
  );
};