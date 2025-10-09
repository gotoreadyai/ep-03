// src/pages/teacher/courses/show.tsx

import { useNavigation, useDelete, useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Edit,
  Users,
  FileText,
  Plus,
  Brain,
  Layout,
  Sparkles,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { FlexBox } from "@/components/shared";
import { SubPage } from "@/components/layout";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { TopicCard } from "./components/TopicCard";
import { ActivityCard } from "./components/ActivityCard";
import { CourseOverview } from "./components/CourseOverview";
import { GroupAccessCard } from "./components/GroupAccessCard";
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
  const { data: identity } = useGetIdentity<any>();
  const isAdmin = identity?.role === "admin";

  // Custom hooks
  const { navigateWithReturn, navigateToWizard } = useNavigationHelper();
  const { 
    course, 
    topics, 
    groups,
    stats, 
    isLoading, 
    refetchTopics, 
    refetchActivities,
    getActivitiesForTopic,
    getMembersCountForGroup,
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
            {/* Edycja kursu dostępna tylko dla admina */}
            {isAdmin && (
              <Button 
                onClick={() => edit("courses", course?.id ?? 0)}
                size="sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edytuj kurs
              </Button>
            )}
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
          <FlexBox>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Grupy z dostępem
            </CardTitle>
            <Badge variant="outline">
              {groups.length} {groups.length === 1 ? 'grupa' : 'grup'}
            </Badge>
          </FlexBox>
        </CardHeader>
        <CardContent>
          {groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <GroupAccessCard
                  key={group.id}
                  group={group}
                  membersCount={getMembersCountForGroup(group.id)}
                  courseId={Number(id)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Brak przypisanych grup do tego kursu</p>
              <p className="text-sm mt-2">
                Administrator może przypisać grupy w ustawieniach kursu
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </SubPage>
  );
};
