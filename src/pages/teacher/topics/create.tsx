import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useOne, useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button, Input, Switch } from "@/components/ui";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Form, FormActions, FormControl } from "@/components/form";
import { SubPage } from "@/components/layout";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const TopicsCreate = () => {
  const { show } = useNavigation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id');

  const { data: courseData } = useOne({
    resource: "courses",
    id: courseId as string,
    queryOptions: {
      enabled: !!courseId,
    },
  });

  const { data: topicsData, isLoading: topicsLoading } = useList({
    resource: "topics",
    filters: [
      {
        field: "course_id",
        operator: "eq",
        value: courseId,
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
      enabled: !!courseId,
    },
  });

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<{
    course_id: number | undefined;
    title: string;
    is_published: boolean;
    position: number;
  }>({
    defaultValues: {
      course_id: courseId ? parseInt(courseId) : undefined,
      is_published: false,
      position: 1,
    },
    refineCoreProps: {
      successNotification: () => ({
        message: "Temat został utworzony",
        type: "success",
      }),
      redirect: false,
      onMutationSuccess: () => {
        if (courseId) {
          show("courses", courseId);
        } else {
          navigate("/courses");
        }
      },
    },
  });

  // Ustaw pozycję gdy dane się załadują
  useEffect(() => {
    if (!topicsLoading && topicsData && topicsData.data.length > 0) {
      const nextPosition = topicsData.data[0].position + 1;
      setValue("position", nextPosition);
    }
  }, [topicsData, topicsLoading, setValue]);

  const handleCancel = () => {
    if (courseId) {
      show("courses", courseId);
    } else {
      navigate("/courses");
    }
  };

  return (
    <SubPage>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCancel}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do kursu
      </Button>

      <FlexBox>
        <Lead
          title="Dodaj temat"
          description={courseData?.data ? `Do kursu: ${courseData.data.title}` : "Utwórz nowy temat"}
        />
      </FlexBox>

      <Card>
        <CardHeader>
          <CardTitle>Informacje o temacie</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onFinish)}>
            <input type="hidden" {...register("course_id")} />
            
            <FormControl
              label="Tytuł tematu"
              htmlFor="title"
              error={errors.title?.message as string}
              required
            >
              <Input
                id="title"
                placeholder="np. Wprowadzenie do zmiennych"
                {...register("title", {
                  required: "Tytuł tematu jest wymagany",
                  minLength: {
                    value: 3,
                    message: "Tytuł musi mieć minimum 3 znaki",
                  },
                })}
              />
            </FormControl>

            <FormControl
              label="Pozycja"
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

            <FormControl label="Status publikacji">
              <FlexBox variant="start">
                <Switch
                  checked={watch("is_published") || false}
                  onCheckedChange={(checked) => setValue("is_published", checked)}
                />
                <span className="text-sm text-muted-foreground">
                  Opublikuj temat od razu
                </span>
              </FlexBox>
            </FormControl>

            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !courseId}
              >
                {isSubmitting ? "Tworzenie..." : "Utwórz temat"}
              </Button>
            </FormActions>
          </Form>
        </CardContent>
      </Card>
    </SubPage>
  );
};