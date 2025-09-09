// components/FlexBox.tsx

import { ReactNode } from "react";

interface FlexBoxProps {
  children: ReactNode;
  variant?: "between-center" | "center" | "start" | "end";
  className?: string;
}

const variantClasses: Record<NonNullable<FlexBoxProps["variant"]>, string> = {
  "between-center": "flex justify-between items-center gap-2",
  "center": "flex justify-center items-center gap-2",
  "start": "flex justify-start items-center gap-2",
  "end": "flex justify-end items-center gap-2",
};

export const FlexBox = ({
  children,
  variant = "between-center",
  className = "",
}: FlexBoxProps) => {
  const baseClasses = variantClasses[variant];
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;
  
  return <div className={combinedClasses}>{children}</div>;
};