// src/pages/teacher/activities/edit.tsx
import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useOne } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, HelpCircle, ListChecks } from "lucide-react";
import { Button, Input, Switch, Badge } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Form, FormActions, FormControl } from "@/components/form";
import { SubPage } from "@/components/layout";
import { MaterialSectionEditor } from "./components/MaterialSectionEditor";

import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";
import { BackToCourseButton } from "../courses/components/BackToCourseButton";

interface ActivityFormData {
  id: number;
  topic_id: number;
  type: string;
  title: string;
  content?: string;
  position: number;
  duration_min?: number;
  is_published: boolean;
  passing_score?: number;
  time_limit?: number;
  max_attempts?: number;
}

export const ActivitiesEdit = () => {
  const { list } = useNavigation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useOne({
    resource: "activities",
    id: id as string,
    liveMode: "off",
    meta: {
      select: "*, topics(*, courses(*))",
    },
  });

  const { data: questionsCount } = useOne({
    resource: "questions",
    id: id as string,
    meta: {
      select: "count",
      filter: `activity_id.eq.${id}`,
    },
    queryOptions: {
      enabled: !!id && data?.data?.type === "quiz",
    },
  });

  const {
    refineCore: { onFinish, formLoading },
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormData>({
    refineCoreProps: {
      resource: "activities",
      id: id as string,
      liveMode: "off",
      redirect: false,
      successNotification: false,
      onMutationSuccess: () => {
        const courseId = data?.data?.topics?.course_id;
        const topicId = data?.data?.topic_id;

        toast.success("Aktywność została zaktualizowana");

        const returnUrl = sessionStorage.getItem("returnUrl");
        if (returnUrl) {
          sessionStorage.removeItem("returnUrl");
          navigate(returnUrl);
        } else if (courseId) {
          navigate(`/teacher/courses/show/${courseId}?expanded=${topicId}`);
        } else {
          list("activities");
        }
      },
      onMutationError: (error: any) => {
        console.error("Błąd podczas aktualizacji:", error);
        
        if (error?.code === "PGRST204") {
          toast.error("Błąd konfiguracji - skontaktuj się z administratorem");
        } else if (error?.code === "23505") {
          toast.error("Aktywność o tej pozycji już istnieje w tym temacie");
        } else if (error?.code === "23503") {
          toast.error("Nieprawidłowe powiązanie z tematem");
        } else if (error?.message) {
          toast.error(`Błąd: ${error.message}`);
        } else {
          toast.error("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
        }
      },
    },
  });

  useEffect(() => {
    if (data?.data) {
      const { topics, _count, questions, ...activityData } = data.data;
      reset(activityData);
    }
  }, [data, reset]);

  const activityType = watch("type") || data?.data?.type || "material";

  if (isLoading || formLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const activity = data?.data;
  const topic = activity?.topics;
  const course = topic?.courses;
  const courseId = course?.id;
  const topicId = activity?.topic_id;

  const handleCancel = () => {
    const returnUrl = sessionStorage.getItem("returnUrl");
    if (returnUrl) {
      sessionStorage.removeItem("returnUrl");
      navigate(returnUrl);
    } else if (courseId) {
      navigate(`/teacher/courses/show/${courseId}?expanded=${topicId}`);
    } else {
      list("activities");
    }
  };

  const getActivityIcon = () => {
    return activityType === "quiz" ? (
      <HelpCircle className="w-6 h-6 text-blue-500" />
    ) : (
      <FileText className="w-6 h-6 text-green-500" />
    );
  };

  const handleManageQuestions = () => {
    const currentUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem('returnUrl', currentUrl);
    navigate(`/teacher/questions/manage/${activity?.id}`);
  };

  const numberOfQuestions = questionsCount?.data?.[0]?.count || 0;

  return (
    <SubPage>
      <BackToCourseButton />
      https://mdxeditor.dev/editor/demo
      <FlexBox>
     
        <Lead
          title={
            <div className="flex items-center gap-2">
              {getActivityIcon()}
              Edytuj aktywność
            </div>
          }
          description={
            <>
              <span className="block text-lg font-medium">{activity?.title}</span>
              <span className="block text-sm text-muted-foreground">
                {course?.title} → Temat {topic?.position}: {topic?.title}
              </span>
            </>
          }
        />
        {activityType === "quiz" && (
          <Button
            onClick={handleManageQuestions}
            variant="outline"
          >
            <ListChecks className="w-4 h-4 mr-2" />
            Zarządzaj pytaniami ({numberOfQuestions})
          </Button>
        )}
      </FlexBox>

      <Card>
        <CardHeader>
          <CardTitle>Informacje o aktywności</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onFinish)}>
            <GridBox variant="1-2-2">
              <FormControl
                label="Typ aktywności"
                error={errors.type?.message as string}
                required
              >
                <Select value={activityType} disabled>
                  <SelectTrigger className="bg-muted">
                    <SelectValue placeholder="Wybierz typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="material">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Materiał
                      </div>
                    </SelectItem>
                    <SelectItem value="quiz">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Quiz
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Typ aktywności nie może być zmieniony
                </p>
              </FormControl>

              <FormControl
                label="Tytuł"
                htmlFor="title"
                error={errors.title?.message as string}
                required
              >
                <Input
                  id="title"
                  placeholder={
                    activityType === "quiz"
                      ? "np. Test wiedzy"
                      : "np. Wprowadzenie"
                  }
                  {...register("title", {
                    required: "Tytuł jest wymagany",
                    minLength: {
                      value: 3,
                      message: "Tytuł musi mieć minimum 3 znaki",
                    },
                  })}
                />
              </FormControl>

              <FormControl
                label="Pozycja w temacie"
                htmlFor="position"
                error={errors.position?.message as string}
                required
              >
                <Input
                  id="position"
                  type="number"
                  min="1"
                  {...register("position", {
                    required: "Pozycja jest wymagana",
                    min: {
                      value: 1,
                      message: "Pozycja musi być większa od 0",
                    },
                    valueAsNumber: true,
                  })}
                />
              </FormControl>

              <FormControl
                label="Czas trwania (min)"
                htmlFor="duration_min"
                hint="Szacowany czas potrzebny na ukończenie"
              >
                <Input
                  id="duration_min"
                  type="number"
                  min="1"
                  placeholder="np. 15"
                  {...register("duration_min", {
                    min: {
                      value: 1,
                      message: "Czas musi być większy od 0",
                    },
                    valueAsNumber: true,
                  })}
                />
              </FormControl>
            </GridBox>

            {activityType === "material" && (
              <>
                <MaterialSectionEditor
                  value={watch("content") || ""}
                  onChange={(value) => setValue("content", value)}
                  label="Treść materiału"
                  error={errors.content?.message as string}
                  required
                  hint="Edytuj każdą sekcję osobno. Struktura: 6 głównych sekcji. Pytania kontrolne dodajesz przez generator (krok 4)."
                />
                
                <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                  <CardContent className="pt-6">
                    <p className="text-sm">
                      <strong className="text-blue-700 dark:text-blue-300">
                        Struktura materiału:
                      </strong>
                    </p>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 mt-2 ml-4 space-y-1">
                      <li>6 głównych sekcji: Cele → Pojęcia → Omówienie → Przykłady → Błędy → Podsumowanie</li>
                      <li>Każda sekcja ma własny edytor (rozwiń/zwiń strzałką)</li>
                      <li>Przycisk oka - podgląd, przycisk kodu - edycja</li>
                      <li>Pytania kontrolne (```quiz) dodajesz przez generator w kroku 4</li>
                      <li>Uczeń musi odpowiedzieć poprawnie aby odhaczyć sekcję</li>
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}

            {activityType === "quiz" && (
              <>
                <GridBox variant="1-1-1">
                  <FormControl
                    label="Próg zaliczenia (%)"
                    htmlFor="passing_score"
                    error={errors.passing_score?.message as string}
                    hint="Minimalny wynik do zaliczenia"
                  >
                    <Input
                      id="passing_score"
                      type="number"
                      min="0"
                      max="100"
                      {...register("passing_score", {
                        min: {
                          value: 0,
                          message: "Wartość minimalna to 0",
                        },
                        max: {
                          value: 100,
                          message: "Wartość maksymalna to 100",
                        },
                        valueAsNumber: true,
                      })}
                    />
                  </FormControl>

                  <FormControl
                    label="Limit czasu (min)"
                    htmlFor="time_limit"
                    hint="Pozostaw puste dla braku limitu"
                  >
                    <Input
                      id="time_limit"
                      type="number"
                      min="1"
                      placeholder="Brak limitu"
                      {...register("time_limit", {
                        min: {
                          value: 1,
                          message: "Limit musi być większy od 0",
                        },
                        valueAsNumber: true,
                      })}
                    />
                  </FormControl>

                  <FormControl
                    label="Maksymalna liczba prób"
                    htmlFor="max_attempts"
                    hint="Pozostaw puste dla nieograniczonej liczby"
                  >
                    <Input
                      id="max_attempts"
                      type="number"
                      min="1"
                      placeholder="Bez limitu"
                      {...register("max_attempts", {
                        min: {
                          value: 1,
                          message: "Minimum 1 próba",
                        },
                        valueAsNumber: true,
                      })}
                    />
                  </FormControl>
                </GridBox>

                {numberOfQuestions > 0 && (
                  <Card className="mt-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            Ten quiz zawiera {numberOfQuestions}{" "}
                            {numberOfQuestions === 1
                              ? "pytanie"
                              : numberOfQuestions < 5
                              ? "pytania" 
                              : "pytań"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Możesz zarządzać pytaniami klikając przycisk powyżej
                          </p>
                        </div>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {numberOfQuestions}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            <FormControl label="Status publikacji">
              <FlexBox variant="start">
                <Switch
                  checked={watch("is_published") || false}
                  onCheckedChange={(checked) =>
                    setValue("is_published", checked)
                  }
                />
                <span className="text-sm text-muted-foreground">
                  Aktywność jest opublikowana (uczniowie mogą ją zobaczyć)
                </span>
              </FlexBox>
            </FormControl>

            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Anuluj
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
            </FormActions>
          </Form>
        </CardContent>
      </Card>
    </SubPage>
  );
};