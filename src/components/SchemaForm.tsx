// components/SchemaForm.tsx
import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormSchemaStore } from "@/utility";
import {
  Alert,
  AlertDescription,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui";
import { Form, FormActions, FormControl } from "./form";
import { GridBox } from "./shared";

interface SchemaFormProps {
  schemaPath: string;
  onSubmit: (data: any) => void;
  submitLabel?: string;
  className?: string;
}

export const SchemaForm: React.FC<SchemaFormProps> = ({
  schemaPath,
  onSubmit,
  submitLabel = "Dalej",
  className = "",
}) => {
  const { getSchemaFragment, setData, getData } = useFormSchemaStore();
  const [processId] = schemaPath.split(".");
  const [formError, setFormError] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  );

  const schema = getSchemaFragment(schemaPath);
  const formData = getData(processId);

  if (!schema) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Nie znaleziono schematu dla ścieżki: {schemaPath}
        </AlertDescription>
      </Alert>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});

    // Walidacja pól wymaganych
    const errors: Record<string, string> = {};
    if (schema.required) {
      for (const field of schema.required) {
        if (!formData[field]) {
          errors[field] = `To pole jest wymagane`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Custom walidacja
    if (schema.validation) {
      const error = schema.validation(formData);
      if (error) {
        setFormError(error);
        return;
      }
    }

    onSubmit(formData);
  };

  const updateField = (fieldName: string, value: any) => {
    setData(processId, { ...formData, [fieldName]: value });
    // Czyść błąd pola przy edycji
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const renderField = (fieldName: string, fieldSchema: any) => {
    const value = formData[fieldName] || "";
    const isRequired = schema.required?.includes(fieldName);
    const fieldError = fieldErrors[fieldName];

    switch (fieldSchema.type) {
      case "text":
      case "email":
      case "password":
        return (
          <FormControl
            key={fieldName}
            label={fieldSchema.title || fieldName}
            htmlFor={fieldName}
            error={fieldError}
            required={isRequired}
          >
            <Input
              id={fieldName}
              type={fieldSchema.type}
              value={value}
              placeholder={fieldSchema.placeholder}
              onChange={(e) => updateField(fieldName, e.target.value)}
              className={fieldError ? "border-red-500" : ""}
            />
          </FormControl>
        );

      case "select":
        return (
          <FormControl
            key={fieldName}
            label={fieldSchema.title || fieldName}
            htmlFor={fieldName}
            error={fieldError}
            required={isRequired}
          >
            <Select
              value={value}
              onValueChange={(val) => updateField(fieldName, val)}
            >
              <SelectTrigger className={fieldError ? "border-red-500" : ""}>
                <SelectValue
                  placeholder={fieldSchema.placeholder || "Wybierz opcję"}
                />
              </SelectTrigger>
              <SelectContent>
                {fieldSchema.options?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{schema.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form onSubmit={handleSubmit}>
          <GridBox variant="1-1-1">
            {schema.properties &&
              Object.entries(schema.properties).map(
                ([fieldName, fieldSchema]) =>
                  renderField(fieldName, fieldSchema)
              )}

            {formError && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
          </GridBox>
          <FormActions className="mt-6 pt-6">
            <Button type="submit" className="w-full sm:w-auto">
              {submitLabel}
            </Button>
          </FormActions>
        </Form>
      </CardContent>
    </Card>
  );
};
