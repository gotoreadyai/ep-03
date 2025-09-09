// src/pages/admin/permissions/users/edit.tsx
import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useOne } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from "@/components/ui";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Form, FormActions, FormControl } from "@/components/form";
import { SubPage } from "@/components/layout";
import { ArrowLeft, Edit, Mail, User, Shield, AlertTriangle } from "lucide-react";
import { useParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserFormData {
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  is_active: boolean;
}

export const UsersEdit = () => {
  const { list } = useNavigation();
  const { id } = useParams();

  const { data, isLoading } = useOne({
    resource: "users",
    id: id as string,
  });

  const user = data?.data;

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    refineCoreProps: {
      resource: "users",
      id: id as string,
      successNotification: () => ({
        message: "Użytkownik został zaktualizowany",
        type: "success",
      }),
    },
  });

  if (isLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const roleOptions = [
    { value: 'student', label: 'Uczeń', icon: <User className="w-4 h-4" /> },
    { value: 'teacher', label: 'Nauczyciel', icon: <Shield className="w-4 h-4 text-blue-500" /> },
    { value: 'admin', label: 'Administrator', icon: <Shield className="w-4 h-4 text-red-500" /> },
  ];

  return (
    <SubPage>
      <Button
        variant="outline"
        size="sm"
        onClick={() => list("permissions-users")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do listy
      </Button>

      <FlexBox>
        <Lead
          title="Edytuj użytkownika"
          description={`Edycja: ${user?.full_name}`}
        />
      </FlexBox>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Dane użytkownika
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onFinish)}>
            <FormControl
              label="Email"
              htmlFor="email"
              error={errors.email?.message as string}
              required
            >
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="uzytkownik@example.com"
                  className="pl-10"
                  {...register("email", {
                    required: "Email jest wymagany",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Nieprawidłowy format email",
                    },
                  })}
                />
              </div>
            </FormControl>

            <FormControl
              label="Imię i nazwisko"
              htmlFor="full_name"
              error={errors.full_name?.message as string}
              required
            >
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="full_name"
                  placeholder="Jan Kowalski"
                  className="pl-10"
                  {...register("full_name", {
                    required: "Imię i nazwisko są wymagane",
                    minLength: {
                      value: 3,
                      message: "Imię i nazwisko muszą mieć minimum 3 znaki",
                    },
                  })}
                />
              </div>
            </FormControl>

            <FormControl
              label="Rola"
              htmlFor="role"
              error={errors.role?.message as string}
              required
            >
              <Select
                value={watch("role")}
                onValueChange={(value: any) => setValue("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz rolę" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>

            <FormControl label="Status">
              <FlexBox variant="start">
                <Switch
                  checked={watch("is_active") || false}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                />
                <div>
                  <span className="text-sm font-medium">
                    Konto aktywne
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Nieaktywni użytkownicy nie mogą się zalogować
                  </p>
                </div>
              </FlexBox>
            </FormControl>

            {watch("role") !== user?.role && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Uwaga:</strong> Zmiana roli użytkownika może wpłynąć na jego dostęp do systemu.
                  {user?.role === 'admin' && watch("role") !== 'admin' && (
                    <span className="block mt-1">
                      Odbierasz uprawnienia administratora!
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={() => list("permissions-users")}
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Dodatkowe akcje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Mail className="w-4 h-4 mr-2" />
            Wyślij link do resetowania hasła
          </Button>
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Zresetuj wszystkie sesje użytkownika
          </Button>
        </CardContent>
      </Card>
    </SubPage>
  );
};