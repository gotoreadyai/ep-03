// components/FormActions.tsx

import { ReactNode } from "react";

interface FormActionsProps {
  children: ReactNode;
  className?: string;
}

export const FormActions = ({ 
  children, 
  className = ""
}: FormActionsProps) => {
  const baseClasses = "flex justify-end items-center gap-4 pt-6 border-t";
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;
  
  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
};