import { ReactNode, cloneElement, isValidElement } from "react";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  children: ReactNode;
  label?: ReactNode;
  htmlFor?: string;
  error?: string | undefined;
  required?: boolean;
  className?: string;
  hint?: string;
}

export const FormControl = ({
  children,
  label,
  htmlFor,
  error,
  required = false,
  className = "",
  hint,
}: FormFieldProps) => {
  const baseClasses = "space-y-2";
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  // Funkcja do dodawania gwiazdki do label
  const renderLabel = () => {
    if (!label) return null;

    if (typeof label === "string") {
      return (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
      );
    }

    return (
      <Label htmlFor={htmlFor} className="flex items-center">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
    );
  };

  // Sprawdzamy, czy children to pojedynczy element React
  const enhancedChildren = isValidElement(children)
    ? cloneElement(children as React.ReactElement, {
        className: `${(children as React.ReactElement).props.className || ""} ${
          error ? "border-red-500 ring-1 ring-red-500" : ""
        }`.trim(),
      })
    : children;

  return (
    <div className={combinedClasses}>
      {renderLabel()}
      {enhancedChildren}
      {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};