import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useOne } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, Input, Switch } from "@/components/ui";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Form, FormActions, FormControl } from "@/components/form";
import { SubPage } from "@/components/layout";

import { useParams, useNavigate } from "react-router-dom";
import { BackToCourseButton } from "../courses/components/BackToCourseButton";


export const TopicsEdit = () => {
  const { show } = useNavigation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useOne({
    resource: "topics",
    id: id as string,
    liveMode: "off",
  });

  const topic = data?.data;
  const courseId = topic?.course_id;

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<{
    title: string;
    is_published: boolean;
    position: number;
  }>({
    refineCoreProps: {
      resource: "topics",
      id: id as string,
      liveMode: "off",
      successNotification: () => ({
        message: "Temat został zaktualizowany",
        type: "success",
      }),
      redirect: false,
      onMutationSuccess: () => {
        // Sprawdź czy mamy zapisany URL powrotu
        const returnUrl = sessionStorage.getItem('returnUrl');
        if (returnUrl) {
          sessionStorage.removeItem('returnUrl');
          navigate(returnUrl);
        } else if (courseId) {
          // Fallback - wróć do kursu z rozwinietym tematem
          navigate(`/teacher/courses/show/${courseId}?expanded=${id}`);
        }
      },
    }
  });

  const handleCancel = () => {
    // Sprawdź czy mamy zapisany URL powrotu
    const returnUrl = sessionStorage.getItem('returnUrl');
    if (returnUrl) {
      sessionStorage.removeItem('returnUrl');
      navigate(returnUrl);
    } else if (courseId) {
      // Fallback - wróć do kursu z rozwinietym tematem
      navigate(`/teacher/courses/show/${courseId}?expanded=${id}`);
    } else {
      show("courses", "");
    }
  };

  if (isLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  return (
    <SubPage>
      <BackToCourseButton/>

      <FlexBox>
        <Lead
          title="Edytuj temat"
          description={`Edycja: ${topic?.title}`}
        />
      </FlexBox>

      <Card>
        <CardHeader>
          <CardTitle>Informacje o temacie</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onFinish)}>
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
                  Temat jest opublikowany
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
                disabled={isSubmitting}
              >
                {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
            </FormActions>
          </Form>
        </CardContent>
      </Card>
    </SubPage>
  );
};