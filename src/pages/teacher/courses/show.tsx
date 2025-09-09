// src/pages/teacher/courses/show.tsx

import { useNavigation, useDelete } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Edit,
  Users,
  FileText,
  Plus,
  Wand,
  Brain,
  Layout,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui";
import { FlexBox } from "@/components/shared";
import { SubPage } from "@/components/layout";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { TopicCard } from "./components/TopicCard";
import { ActivityCard } from "./components/ActivityCard";
import { CourseOverview } from "./components/CourseOverview";
import { LoadingState, CourseStats, DraggableList } from "./components/shared";
import { 
  useCourseData, 
  useNavigationHelper, 
  usePublishToggle,
  usePositionManager,
} from "./hooks";

export const CoursesShow = () => {
  const { list, edit } = useNavigation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Custom hooks
  const { navigateWithReturn, navigateToWizard } = useNavigationHelper();
  const { 
    course, 
    topics, 
    stats, 
    isLoading, 
    refetchTopics, 
    refetchActivities,
    getActivitiesForTopic 
  } = useCourseData(id);
  const { togglePublish: toggleTopicPublish } = usePublishToggle('topics');
  const { togglePublish: toggleActivityPublish } = usePublishToggle('activities');
  
  // Użyj hooka do zarządzania pozycjami
  const { updatePosition: updateTopicPosition, isUpdating: isUpdatingTopics } = usePositionManager('topics');
  const { updatePosition: updateActivityPosition, isUpdating: isUpdatingActivities } = usePositionManager('activities');

  // Delete mutations
  const { mutate: deleteTopic } = useDelete();
  const { mutate: deleteActivity } = useDelete();

  // UI state
  const expandedTopicId = searchParams.get("expanded");

  if (isLoading) return <LoadingState />;

  if (!course) {
    return (
      <SubPage>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nie znaleziono kursu</p>
        </div>
      </SubPage>
    );
  }

  // Event handlers
  const toggleTopic = (topicId: number) => {
    if (expandedTopicId === topicId.toString()) {
      searchParams.delete("expanded");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ expanded: topicId.toString() });
    }
  };

  const handleDeleteTopic = (topicId: number, title: string) => {
    if (confirm(`Czy na pewno chcesz usunąć temat "${title}" wraz ze wszystkimi aktywnościami?`)) {
      deleteTopic(
        {
          resource: "topics",
          id: topicId,
        },
        {
          onSuccess: () => {
            toast.success("Temat został usunięty");
            refetchTopics();
            refetchActivities();
            if (expandedTopicId === topicId.toString()) {
              searchParams.delete("expanded");
              setSearchParams(searchParams);
            }
          },
        }
      );
    }
  };

  const handleDeleteActivity = (activityId: number, title: string) => {
    if (confirm(`Czy na pewno chcesz usunąć aktywność "${title}"?`)) {
      deleteActivity(
        {
          resource: "activities",
          id: activityId,
        },
        {
          onSuccess: () => {
            toast.success("Aktywność została usunięta");
            refetchActivities();
            refetchTopics();
          },
        }
      );
    }
  };

  // Handler dla zmiany kolejności tematów - tylko jedna pozycja
  const handleTopicReorder = async (topicId: number, newPosition: number) => {
    try {
      await updateTopicPosition(topicId, newPosition);
    } catch (error) {
      console.error("Failed to reorder topic:", error);
    }
  };

  // Handler dla zmiany kolejności aktywności - tylko jedna pozycja
  const handleActivityReorder = async (activityId: number, newPosition: number) => {
    try {
      await updateActivityPosition(activityId, newPosition);
    } catch (error) {
      console.error("Failed to reorder activity:", error);
    }
  };

  return (
    <SubPage>
      <Button variant="outline" size="sm" onClick={() => list("courses")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do listy
      </Button>

      {/* Nagłówek kursu */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Szczegóły kursu</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigateWithReturn(`/teacher/course-structure/edit/${course?.id}`)}
              size="sm"
              variant="secondary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Edytuj z AI
            </Button>
            <Button 
              onClick={() => edit("courses", course?.id ?? 0)}
              size="sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edytuj kurs
            </Button>
          </div>
        </div>
        <CourseOverview course={course} />
      </div>

      {/* Statystyki kursu */}
      <CourseStats 
        course={course}
        topicsCount={stats.topicsCount}
        activitiesCount={stats.activitiesCount}
        accessCount={stats.accessCount}
      />

      {/* Struktura kursu */}
      <Card>
        <CardHeader>
          <FlexBox>
            <CardTitle className="flex items-center gap-2">
              Struktura kursu
              {(isUpdatingTopics || isUpdatingActivities) && (
                <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Zapisywanie...
                </span>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateWithReturn(`/teacher/course-structure/edit/${course?.id}`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Dodaj tematy z AI
              </Button>
              <Button
                size="sm"
                onClick={() => navigateWithReturn(`/teacher/topics/create?course_id=${id}`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Dodaj temat
              </Button>
            </div>
          </FlexBox>
        </CardHeader>
        <CardContent>
          {topics.length > 0 ? (
            <DraggableList
              items={topics}
              onReorder={handleTopicReorder}
              disabled={isUpdatingTopics || isUpdatingActivities}
              renderItem={(topic, index, dragHandleProps) => {
                const activities = getActivitiesForTopic(topic.id);
                const isExpanded = expandedTopicId === topic.id.toString();

                return (
                  <TopicCard
                    key={topic.id}
                    topic={{
                      ...topic,
                      position: index + 1 // Przekazujemy numer wyświetlania
                    }}
                    isExpanded={isExpanded}
                    onToggle={() => toggleTopic(topic.id)}
                    onDelete={handleDeleteTopic}
                    onEdit={(resource, id) => navigateWithReturn(`/${resource}/edit/${id}`)}
                    onTogglePublish={(id, state, title) => 
                      toggleTopicPublish(id, state, title, refetchTopics)
                    }
                    activitiesCount={activities.length}
                    onNavigateToWizard={navigateToWizard}
                    courseId={Number(course?.id)}
                    courseTitle={course?.title}
                    dragHandleProps={dragHandleProps}
                  >
                    {activities.length > 0 ? (
                      <DraggableList
                        items={activities}
                        onReorder={handleActivityReorder}
                        disabled={isUpdatingActivities}
                        renderItem={(activity, idx, activityDragProps) => (
                          <ActivityCard
                            key={activity.id}
                            activity={{
                              ...activity,
                              position: idx + 1 // Przekazujemy numer wyświetlania
                            }}
                            topicPosition={index + 1} // Używamy index tematu
                            onDelete={handleDeleteActivity}
                            onEdit={(resource, id) => navigateWithReturn(`/${resource}/edit/${id}`)}
                            onTogglePublish={(id, state, title) =>
                              toggleActivityPublish(id, state, title, refetchActivities)
                            }
                            dragHandleProps={activityDragProps}
                          />
                        )}
                      />
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>Brak aktywności w tym temacie</p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigateWithReturn(`/activities/create?topic_id=${topic.id}`)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Dodaj ręcznie
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              navigateToWizard("/teacher/educational-material/step1", {
                                courseId: course?.id,
                                courseTitle: course?.title,
                                topicId: topic.id,
                                topicTitle: topic.title,
                              })
                            }
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generuj materiał z AI
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              navigateToWizard("/teacher/quiz-wizard/step1", {
                                courseId: course?.id,
                                courseTitle: course?.title,
                                topicId: topic.id,
                                topicTitle: topic.title,
                              })
                            }
                          >
                            <Brain className="w-4 h-4 mr-2" />
                            Generuj quiz z AI
                          </Button>
                        </div>
                      </div>
                    )}
                  </TopicCard>
                );
              }}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Brak tematów w tym kursie</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <Button
                  onClick={() => navigateWithReturn(`/topics/create?course_id=${id}`)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj pierwszy temat
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigateWithReturn(`/teacher/course-structure/edit/${course?.id}`)}
                >
                  <Layout className="w-4 h-4 mr-2" />
                  Wygeneruj strukturę z AI
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grupy z dostępem */}
      <Card>
        <CardHeader>
          <CardTitle>Grupy z dostępem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Lista grup (do implementacji)</p>
          </div>
        </CardContent>
      </Card>

      {/* Szybkie akcje AI */}
      <Card className="border-dashed border-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Szybkie akcje AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4 bg-white dark:bg-background"
              onClick={() => navigateWithReturn(`/teacher/course-structure/edit/${course?.id}`)}
            >
              <div className="flex items-start gap-3">
                <Layout className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">Rozbuduj strukturę kursu</div>
                  <div className="text-xs text-muted-foreground">
                    Dodaj nowe tematy z AI
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4 bg-white dark:bg-background"
              onClick={() =>
                navigateToWizard("/educational-material/step1", {
                  courseId: course?.id,
                  courseTitle: course?.title,
                })
              }
            >
              <div className="flex items-start gap-3">
                <Wand className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">Generuj materiał</div>
                  <div className="text-xs text-muted-foreground">
                    Stwórz treści z AI
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4 bg-white dark:bg-background"
              onClick={() =>
                navigateToWizard("/quiz-wizard/step1", {
                  courseId: course?.id,
                  courseTitle: course?.title,
                })
              }
            >
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">Stwórz quiz</div>
                  <div className="text-xs text-muted-foreground">
                    Quiz sprawdzający z AI
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </SubPage>
  );
};