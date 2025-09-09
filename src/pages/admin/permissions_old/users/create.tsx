// src/pages/admin/permissions/users/create.tsx
import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from "@/components/ui";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Form, FormActions, FormControl } from "@/components/form";
import { SubPage } from "@/components/layout";
import { ArrowLeft, UserPlus, Mail, User, Shield } from "lucide-react";
import { User as UserType } from "@/utility/auth/userCache";

interface UserFormData {
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  is_active: boolean;
  vendor_id: number;
}

export const UsersCreate = () => {
  const { list } = useNavigation();
  const { data: currentUser } = useGetIdentity<UserType>();
  
  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    defaultValues: {
      role: 'student',
      is_active: true,
      vendor_id: currentUser?.vendor_id || 1,
    },
    refineCoreProps: {
      resource: "users",
      successNotification: () => ({
        message: "Użytkownik został utworzony",
        type: "success",
      }),
      errorNotification: (error: any) => {
        if (error?.message?.includes("duplicate key")) {
          return {
            message: "Użytkownik z tym adresem email już istnieje",
            type: "error",
          };
        }
        return {
          message: "Błąd podczas tworzenia użytkownika",
          type: "error",
        };
      },
    },
  });

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
          title="Dodaj użytkownika"
          description="Utwórz nowe konto użytkownika"
        />
      </FlexBox>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Dane użytkownika
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onFinish)}>
            <input type="hidden" {...register("vendor_id")} />
            
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

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Uwaga:</strong> Po utworzeniu użytkownika otrzyma on email z linkiem do ustawienia hasła.
              </p>
            </div>

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
                {isSubmitting ? "Tworzenie..." : "Utwórz użytkownika"}
              </Button>
            </FormActions>
          </Form>
        </CardContent>
      </Card>
    </SubPage>
  );
};