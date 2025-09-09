// components/Form.tsx

import { ReactNode, FormHTMLAttributes } from "react";

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const Form = ({ 
  children, 
  onSubmit,
  className = "",
  ...props 
}: FormProps) => {
  const baseClasses = "space-y-6";
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;
  
  return (
    <form 
      onSubmit={onSubmit} 
      className={combinedClasses}
      {...props}
    >
      {children}
    </form>
  );
};
