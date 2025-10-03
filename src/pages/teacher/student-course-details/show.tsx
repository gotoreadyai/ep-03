import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubPage } from "@/components/layout";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useStudentCourseDetails } from "./hooks/useStudentCourseDetails";
import { StudentHeader } from "./components/StudentHeader";
import { OverallProgressCard } from "./components/OverallProgressCard";
import { TopicActivityList } from "./components/TopicActivityList";

export const StudentCourseDetailsShow = () => {
  const { groupId, courseId, studentId } = useParams();
  const navigate = useNavigate();

  const { student, group, course, topicsWithActivities, overallStats, isLoading } =
    useStudentCourseDetails(groupId!, courseId!, studentId!);

  const handleViewQuizDetails = (activityId: number) => {
    // TODO: Implement quiz details modal/page
    console.log("View quiz details for activity:", activityId);
  };

  if (isLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </SubPage>
    );
  }

  if (!student || !group || !course) {
    return (
      <SubPage>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nie znaleziono danych ucznia, grupy lub kursu
          </p>
        </div>
      </SubPage>
    );
  }

  return (
    <SubPage>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          navigate(`/teacher/groups/${groupId}/courses/${courseId}/activity`)
        }
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do aktywności grupy
      </Button>

      <StudentHeader
        student={student}
        course={course}
        group={group}
        progressPercentage={overallStats.progressPercentage}
      />

      <OverallProgressCard stats={overallStats} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Szczegółowy postęp w kursie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TopicActivityList
            topics={topicsWithActivities}
            onViewQuizDetails={handleViewQuizDetails}
          />
        </CardContent>
      </Card>
    </SubPage>
  );
};