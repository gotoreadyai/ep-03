// components/FlexBox.tsx

import { ReactNode } from "react";

interface GridBoxProps {
  children: ReactNode;
  variant?: "1-2-3" | "1-2-2"| "1-1-1" | "2-2-4";
  className?: string;
}

const variantClasses: Record<NonNullable<GridBoxProps["variant"]>, string> = {
 
  "1-2-3": "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
  "1-2-2": "grid gap-6 md:grid-cols-2",
  "1-1-1": "grid gap-6",
  "2-2-4": "grid gap-6 grid-cols-2 lg:grid-cols-4",
};

export const GridBox = ({
  children,
  variant = "1-2-3",
  className = "",
}: GridBoxProps) => {
  const baseClasses = variantClasses[variant];
  const combinedClasses = className
    ? `${baseClasses} ${className}`
    : baseClasses;

  return <div className={combinedClasses}>{children}</div>;
};