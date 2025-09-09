import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button, Input, Switch } from "@/components/ui";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Form, FormActions, FormControl } from "@/components/form";
import { SubPage } from "@/components/layout";

interface GroupFormData {
  name: string;
  academic_year: string;
  vendor_id: number;
  is_active: boolean;
}

export const GroupsCreate = () => {
  const { list } = useNavigation();
  const { data: identity } = useGetIdentity<any>();

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GroupFormData>({
    defaultValues: {
      name: '',
      vendor_id: identity?.vendor_id || 0,
      is_active: true,
      academic_year: new Date().getFullYear().toString() + "/" + (new Date().getFullYear() + 1).toString()
    }
  });

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
          title="Dodaj grupę"
          description="Utwórz nową grupę uczniów"
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
              error={errors.name?.message?.toString()}
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
              error={errors.academic_year?.message?.toString()}
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
                {isSubmitting ? "Tworzenie..." : "Utwórz grupę"}
              </Button>
            </FormActions>
          </Form>
        </CardContent>
      </Card>
    </SubPage>
  );
};