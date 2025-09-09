import { useEffect } from "react";
import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useOne } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button, Input, Switch } from "@/components/ui";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Form, FormActions, FormControl } from "@/components/form";
import { SubPage } from "@/components/layout";
import { useParams } from "react-router-dom";

export const GroupsEdit = () => {
  const { list } = useNavigation();
  const { id } = useParams();

  const { data, isLoading } = useOne({
    resource: "groups",
    id: id as string,
    liveMode: "off", // Wyłącz live mode dla tego zapytania
  });

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    refineCoreProps: {
      resource: "groups",
      id: id as string,
      redirect: "list",
      liveMode: "off", // Wyłącz live mode dla formularza
    }
  });

  // Ustaw wartości formularza po załadowaniu danych
  useEffect(() => {
    if (data?.data) {
      reset({
        name: data.data.name,
        academic_year: data.data.academic_year,
        is_active: data.data.is_active,
        vendor_id: data.data.vendor_id,
      });
    }
  }, [data, reset]);

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
      <Button
        variant="outline"
        size="sm"
        onClick={() => list("groups")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do listy
      </Button>

      <FlexBox>
        <Lead
          title="Edytuj grupę"
          description={`Edycja: ${data?.data?.name}`}
        />
      </FlexBox>

      <Card>
        <CardHeader>
          <CardTitle>Informacje o grupie</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onFinish)}>
            <FormControl
              label="Nazwa grupy"
              htmlFor="name"
              error={errors.name?.message as string}
              required
            >
              <Input
                id="name"
                placeholder="np. Klasa 1A"
                {...register("name", {
                  required: "Nazwa grupy jest wymagana",
                  minLength: {
                    value: 2,
                    message: "Nazwa musi mieć minimum 2 znaki",
                  },
                })}
              />
            </FormControl>

            <FormControl
              label="Rok akademicki"
              htmlFor="academic_year"
              error={errors.academic_year?.message as string}
              required
            >
              <Input
                id="academic_year"
                placeholder="np. 2024/2025"
                {...register("academic_year", {
                  required: "Rok akademicki jest wymagany",
                  pattern: {
                    value: /^\d{4}\/\d{4}$/,
                    message: "Format: RRRR/RRRR (np. 2024/2025)",
                  },
                })}
              />
            </FormControl>

            <FormControl label="Status grupy">
              <FlexBox variant="start">
                <Switch
                  checked={watch("is_active")}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                />
                <span className="text-sm text-muted-foreground">
                  Grupa aktywna
                </span>
              </FlexBox>
            </FormControl>

            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={() => list("groups")}
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