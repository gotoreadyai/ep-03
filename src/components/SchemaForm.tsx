// components/SchemaForm.tsx
import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStepStore } from "@/utility/formWizard/stepStore";
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

/**
 * Oczekiwania:
 * - schemaPath: "stepId" lub "stepId.nested.path"
 * - Schemat pochodzi z useStepStore().schemas[stepId]
 * - Typy pól zgodne z src/utility/formWizard/types.ts
 *   ("string" | "number" | "boolean" | "object" | "array" | "enum")
 * - required: wspieramy zarówno root.required: string[], jak i field.required: boolean
 */

interface SchemaFormProps {
  schemaPath: string;
  onSubmit: (data: any) => void;
  submitLabel?: string;
  className?: string;
}

// Pomocniczo: pobranie fragmentu schematu po ścieżce
function getSchemaFragmentFromStore(
  schemas: Record<string, any>,
  schemaPath: string
) {
  const parts = schemaPath.split(".");
  const stepId = parts[0];
  let node = schemas[stepId]?.schema ?? schemas[stepId]; // wsparcie dla dwóch wariantów rejestracji
  for (let i = 1; i < parts.length && node; i++) {
    const key = parts[i];
    // zwykle w JSON Schema wchodzimy przez .properties
    if (node?.properties?.[key]) node = node.properties[key];
    else node = node?.[key];
  }
  return { stepId, fragment: node };
}

export const SchemaForm: React.FC<SchemaFormProps> = ({
  schemaPath,
  onSubmit,
  submitLabel = "Dalej",
  className = "",
}) => {
  const { schemas, getStepData, setStepData } = useStepStore();
  const [formError, setFormError] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  );

  const { stepId, fragment: schema } = React.useMemo(
    () => getSchemaFragmentFromStore(schemas, schemaPath),
    [schemas, schemaPath]
  );

  const formData = useStepStore((s) => s.getStepData(stepId));

  if (!schema) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Nie znaleziono schematu dla ścieżki: {schemaPath}
        </AlertDescription>
      </Alert>
    );
  }

  const isFieldRequired = (fieldName: string, fieldSchema: any) => {
    if (Array.isArray(schema.required) && schema.required.includes(fieldName))
      return true;
    if (fieldSchema && typeof fieldSchema.required === "boolean")
      return fieldSchema.required;
    return false;
  };

  const setData = (data: any) => setStepData(stepId, data);

  const updateField = (fieldName: string, value: any) => {
    setData({ ...formData, [fieldName]: value });
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const validateRequired = () => {
    const errors: Record<string, string> = {};
    const walk = (node: any, pathPrefix = "") => {
      if (!node) return;
      const props = node.properties;
      if (!props) return;
      Object.entries(props).forEach(([name, def]: [string, any]) => {
        const path = pathPrefix ? `${pathPrefix}.${name}` : name;
        const req = Array.isArray(node.required)
          ? node.required.includes(name)
          : !!def?.required;
        if (def?.type === "object") {
          walk(def, path);
        } else if (req) {
          const key = pathPrefix ? pathPrefix.split(".")[0] : name;
          const value =
            pathPrefix === ""
              ? formData[name]
              : formData[pathPrefix]?.[name] ?? undefined;
          if (
            value === undefined ||
            value === null ||
            (typeof value === "string" && value.trim() === "")
          ) {
            errors[path] = "To pole jest wymagane";
          }
        }
      });
    };
    walk(schema);
    return errors;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});

    const reqErrors = validateRequired();
    if (Object.keys(reqErrors).length > 0) {
      // mapuj do kluczy top-level jeśli walidacja zagnieżdżona
      const flattened: Record<string, string> = {};
      Object.keys(reqErrors).forEach((k) => {
        const top = k.split(".")[0];
        flattened[top] = reqErrors[k];
      });
      setFieldErrors(flattened);
      return;
    }

    // Opcjonalna niestandardowa walidacja, jeśli ktoś dodał do schematu
    if (typeof schema.validation === "function") {
      const error = schema.validation(formData);
      if (error) {
        setFormError(error);
        return;
      }
    }

    onSubmit(formData);
  };

  const renderScalar = (
    fieldName: string,
    fieldSchema: any,
    value: any,
    fieldError?: string
  ) => {
    const required = isFieldRequired(fieldName, fieldSchema);

    switch (fieldSchema.type) {
      case "string": {
        // jeśli ktoś w schemacie doda "format": "email" | "password" – obsłużmy
        const inputType =
          fieldSchema.format === "email"
            ? "email"
            : fieldSchema.format === "password"
            ? "password"
            : "text";
        return (
          <FormControl
            key={fieldName}
            label={fieldSchema.label || fieldSchema.title || fieldName}
            htmlFor={fieldName}
            error={fieldError}
            required={required}
          >
            <Input
              id={fieldName}
              type={inputType}
              value={value ?? ""}
              placeholder={fieldSchema.placeholder}
              onChange={(e) => updateField(fieldName, e.target.value)}
              className={fieldError ? "border-red-500" : ""}
            />
          </FormControl>
        );
      }
      case "number": {
        return (
          <FormControl
            key={fieldName}
            label={fieldSchema.label || fieldSchema.title || fieldName}
            htmlFor={fieldName}
            error={fieldError}
            required={required}
          >
            <Input
              id={fieldName}
              type="number"
              value={value ?? ""}
              placeholder={fieldSchema.placeholder}
              onChange={(e) =>
                updateField(
                  fieldName,
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className={fieldError ? "border-red-500" : ""}
            />
          </FormControl>
        );
      }
      case "boolean": {
        return (
          <FormControl
            key={fieldName}
            label={fieldSchema.label || fieldSchema.title || fieldName}
            htmlFor={fieldName}
            error={fieldError}
            required={required}
          >
            {/* prosty checkbox jako Input */}
            <div className="flex items-center gap-2">
              <input
                id={fieldName}
                type="checkbox"
                checked={!!value}
                onChange={(e) => updateField(fieldName, e.target.checked)}
              />
              <span className="text-sm text-muted-foreground">
                {fieldSchema.description}
              </span>
            </div>
          </FormControl>
        );
      }
      case "enum": {
        const options: string[] = fieldSchema.options ?? [];
        return (
          <FormControl
            key={fieldName}
            label={fieldSchema.label || fieldSchema.title || fieldName}
            htmlFor={fieldName}
            error={fieldError}
            required={required}
          >
            <Select
              value={value ?? ""}
              onValueChange={(val) => updateField(fieldName, val)}
            >
              <SelectTrigger className={fieldError ? "border-red-500" : ""}>
                <SelectValue
                  placeholder={fieldSchema.placeholder || "Wybierz opcję"}
                />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        );
      }
      default:
        return null;
    }
  };

  const renderField = (fieldName: string, fieldSchema: any) => {
    const value = formData?.[fieldName];
    const fieldError = fieldErrors[fieldName];

    if (fieldSchema.type === "object" && fieldSchema.properties) {
      // render płaskim gridem – nazwy zagnieżdżone zapisujemy jako obiekt w formData[fieldName]
      const nestedData = formData?.[fieldName] ?? {};
      const updateNested = (k: string, v: any) => {
        updateField(fieldName, { ...nestedData, [k]: v });
      };
      return (
        <div key={fieldName} className="col-span-full">
          <div className="font-medium mb-2">
            {fieldSchema.label || fieldSchema.title || fieldName}
          </div>
          <GridBox variant="1-1-1">
            {Object.entries(fieldSchema.properties).map(
              ([childName, childSchema]: [string, any]) => {
                const childErr =
                  fieldError && typeof fieldError === "string"
                    ? fieldError
                    : undefined;
                const childVal = nestedData?.[childName];
                // używamy renderScalar, ale z własnym updaterem
                switch (childSchema.type) {
                  case "string":
                  case "number":
                  case "boolean":
                  case "enum": {
                    const required = isFieldRequired(childName, childSchema);
                    const label =
                      childSchema.label ||
                      childSchema.title ||
                      `${fieldName}.${childName}`;
                    // ręcznie, bo renderScalar wiąże top-level update
                    if (childSchema.type === "string") {
                      const inputType =
                        childSchema.format === "email"
                          ? "email"
                          : childSchema.format === "password"
                          ? "password"
                          : "text";
                      return (
                        <FormControl
                          key={`${fieldName}.${childName}`}
                          label={label}
                          htmlFor={`${fieldName}.${childName}`}
                          error={childErr}
                          required={required}
                        >
                          <Input
                            id={`${fieldName}.${childName}`}
                            type={inputType}
                            value={childVal ?? ""}
                            placeholder={childSchema.placeholder}
                            onChange={(e) => updateNested(childName, e.target.value)}
                            className={childErr ? "border-red-500" : ""}
                          />
                        </FormControl>
                      );
                    }
                    if (childSchema.type === "number") {
                      return (
                        <FormControl
                          key={`${fieldName}.${childName}`}
                          label={label}
                          htmlFor={`${fieldName}.${childName}`}
                          error={childErr}
                          required={required}
                        >
                          <Input
                            id={`${fieldName}.${childName}`}
                            type="number"
                            value={childVal ?? ""}
                            placeholder={childSchema.placeholder}
                            onChange={(e) =>
                              updateNested(
                                childName,
                                e.target.value === "" ? "" : Number(e.target.value)
                              )
                            }
                            className={childErr ? "border-red-500" : ""}
                          />
                        </FormControl>
                      );
                    }
                    if (childSchema.type === "boolean") {
                      return (
                        <FormControl
                          key={`${fieldName}.${childName}`}
                          label={label}
                          htmlFor={`${fieldName}.${childName}`}
                          error={childErr}
                          required={required}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              id={`${fieldName}.${childName}`}
                              type="checkbox"
                              checked={!!childVal}
                              onChange={(e) =>
                                updateNested(childName, e.target.checked)
                              }
                            />
                            <span className="text-sm text-muted-foreground">
                              {childSchema.description}
                            </span>
                          </div>
                        </FormControl>
                      );
                    }
                    if (childSchema.type === "enum") {
                      const options: string[] = childSchema.options ?? [];
                      return (
                        <FormControl
                          key={`${fieldName}.${childName}`}
                          label={label}
                          htmlFor={`${fieldName}.${childName}`}
                          error={childErr}
                          required={required}
                        >
                          <Select
                            value={childVal ?? ""}
                            onValueChange={(val) => updateNested(childName, val)}
                          >
                            <SelectTrigger
                              className={childErr ? "border-red-500" : ""}
                            >
                              <SelectValue
                                placeholder={
                                  childSchema.placeholder || "Wybierz opcję"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {options.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      );
                    }
                    return null;
                  }
                  default:
                    return null;
                }
              }
            )}
          </GridBox>
        </div>
      );
    }

    // proste typy
    return renderScalar(fieldName, fieldSchema, value, fieldError);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{schema.title || schema.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form onSubmit={handleSubmit}>
          <GridBox variant="1-1-1">
            {schema.properties &&
              Object.entries(schema.properties).map(
                ([fieldName, fieldSchema]) => renderField(fieldName, fieldSchema)
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
