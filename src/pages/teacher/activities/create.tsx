// src/pages/teacher/activities/create.tsx
import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useOne, useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, HelpCircle } from "lucide-react";
import { Button, Input, Switch } from "@/components/ui";
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

import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { BackToCourseButton } from "../courses/components/BackToCourseButton";

interface ActivityFormData {
  id: any;
  topic_id?: number;
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

export const ActivitiesCreate = () => {
  const { show } = useNavigation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topicId = searchParams.get("topic_id");

  // ⬇️ Nowe: odczyt typu z URL (?type=quiz)
  const typeParam = (searchParams.get("type") || "").toLowerCase();
  const initialType = typeParam === "quiz" ? "quiz" : "material";

  const { data: topicData } = useOne({
    resource: "topics",
    id: topicId as string,
    meta: {
      select: "*, courses(*)",
    },
    queryOptions: {
      enabled: !!topicId,
    },
  });

  const { data: activitiesData, isLoading: positionLoading } = useList({
    resource: "activities",
    filters: [
      {
        field: "topic_id",
        operator: "eq",
        value: topicId,
      },
    ],
    sorters: [
      {
        field: "position",
        order: "desc",
      },
    ],
    pagination: {
      pageSize: 1,
    },
    queryOptions: {
      enabled: !!topicId,
    },
  });

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormData>({
    defaultValues: {
      topic_id: topicId ? parseInt(topicId) : undefined,
      type: initialType,              // ⬅️ ustawiamy startowy typ z querystringu
      is_published: false,
      position: 1,
      passing_score: 70,
    },
    refineCoreProps: {
      successNotification: false,
      redirect: false,
      onMutationSuccess: (data) => {
        const courseId = topicData?.data?.course_id;
        const activityType = data.data.type;

        toast.success("Aktywność została utworzona");

        if (activityType === "quiz") {
          toast.info("Dodaj pytania do quizu");
          navigate(`/teacher/questions/manage/${data.data.id}`);
        } else {
          const returnUrl = sessionStorage.getItem("returnUrl");
          if (returnUrl) {
            sessionStorage.removeItem("returnUrl");
            navigate(returnUrl);
          } else if (courseId) {
            navigate(`/teacher/courses/show/${courseId}?expanded=${topicId}`);
          } else {
            navigate("/teacher/courses");
          }
        }
      },
    },
  });

  const activityType = watch("type");

  useEffect(() => {
    if (!positionLoading && activitiesData && activitiesData.data.length > 0) {
      const nextPosition = activitiesData.data[0].position + 1;
      setValue("position", nextPosition);
    }
  }, [activitiesData, positionLoading, setValue]);

  const handleCancel = () => {
    const returnUrl = sessionStorage.getItem("returnUrl");
    if (returnUrl) {
      sessionStorage.removeItem("returnUrl");
      navigate(returnUrl);
    } else if (topicData?.data?.course_id) {
      navigate(`/teacher/courses/show/${topicData.data.course_id}?expanded=${topicId}`);
    } else {
      navigate("/teacher/courses");
    }
  };

  if (!topicId) {
    return (
      <SubPage>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg font-medium text-muted-foreground mb-4">
              Nie wybrano tematu
            </p>
            <Button onClick={() => navigate("/teacher/courses")}>
              Przejdź do kursów
            </Button>
          </CardContent>
        </Card>
      </SubPage>
    );
  }

  return (
    <SubPage>
      <BackToCourseButton/>

      <FlexBox>
        <Lead
          title="Dodaj aktywność"
          description={
            topicData?.data ? (
              <>
                <span className="block text-lg">{topicData.data.courses?.title}</span>
                <span className="block text-sm text-muted-foreground">
                  Temat {topicData.data.position}: {topicData.data.title}
                </span>
              </>
            ) : (
              "Utwórz nowy materiał lub quiz"
            )
          }
        />
      </FlexBox>

      <Card>
        <CardHeader>
          <CardTitle>Informacje o aktywności</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onFinish)}>
            <input type="hidden" {...register("topic_id")} />

            <GridBox variant="1-2-2">
              <FormControl
                label="Typ aktywności"
                error={errors.type?.message as string}
                required
              >
                <Select
                  value={activityType}
                  onValueChange={(value) => setValue("type", value)}
                >
                  <SelectTrigger>
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
                      ? "np. Test wiedzy z rozdziału"
                      : "np. Wprowadzenie do tematu"
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
                  disabled
                  className="bg-muted"
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
                  hint="Edytuj każdą sekcję osobno. Kliknij ikonę oka aby zobaczyć podgląd, kliknij kod aby wrócić do edycji."
                />
                
                <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                  <CardContent className="pt-6">
                    <p className="text-sm">
                      <strong className="text-blue-700 dark:text-blue-300">
                        Wskazówka dla nauczycieli:
                      </strong>
                    </p>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 mt-2 ml-4 space-y-1">
                      <li>Materiał składa się z 6 sekcji</li>
                      <li>Każda sekcja ma własny edytor - rozwiń/zwiń przyciskiem strzałki</li>
                      <li>Używaj Markdown: **pogrubienie**, *kursywa*, listy, tabele</li>
                      <li>Pytania kontrolne dodajesz przez generator (krok 4) w formacie ```quiz</li>
                      <li>Uczniowie muszą odpowiedzieć na pytania aby odhaczyć sekcję</li>
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

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm">
                    <strong className="text-blue-700 dark:text-blue-300">
                      Wskazówka:
                    </strong>{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      Po utworzeniu quizu zostaniesz przekierowany do ekranu
                      dodawania pytań.
                    </span>
                  </p>
                </div>
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
                  Opublikuj aktywność od razu (uczniowie będą mogli ją zobaczyć)
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
              <Button type="submit" disabled={isSubmitting || !topicId}>
                {isSubmitting
                  ? "Tworzenie..."
                  : activityType === "quiz"
                  ? "Utwórz i dodaj pytania"
                  : "Utwórz aktywność"}
              </Button>
            </FormActions>
          </Form>
        </CardContent>
      </Card>
    </SubPage>
  );
};
