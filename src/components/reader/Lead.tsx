// components/reader/Lead.tsx

import { ReactNode } from "react";
import { CardDescription, CardTitle } from "../ui/card";

interface LeadProps {
  title: ReactNode | string;
  description: ReactNode | string;
  variant?: "lg" | "md" |"sm"| "card";
}

const variantClasses: Record<
  NonNullable<LeadProps["variant"]>,
  { wrap: string; title: string; description: string }
> = {
  card: {
    wrap: "space-y-0",
    title: "font-medium",
    description: "text-muted-foreground",
  },
  lg: {
    wrap: "space-y-0",
    title: "text-3xl font-bold tracking-tight",
    description: "text-muted-foreground",
  },
  md: {
    wrap: "space-y-0",
    title: "font-medium",
    description: "text-muted-foreground",
  },
  sm: {
    wrap: "space-y-1",
    title: "font-medium text-sm text-muted-foreground mb-1",
    description: "text-sm",
  },
};

export const Lead = ({ title, description, variant = "lg" }: LeadProps) => {
  const classes = variantClasses[variant];

  const renderTitle = () => {
    switch (variant) {
      case "lg":
        return <h1 className={classes.title}>{title}</h1>;
      case "md":
        return <h2 className={classes.title}>{title}</h2>;
      case "sm":
        return <h3 className={classes.title}>{title}</h3>;
      default:
        return <h1 className={classes.title}>{title}</h1>;
    }
  };

  return variant === "card" ? (
    <>
      <CardTitle className="text-lg font-semibold leading-tight flex items-center gap-2">
        {title}
      </CardTitle>
      <CardDescription className="text-sm text-muted-foreground mt-2">
        {description}
      </CardDescription>
    </>
  ) : (
    <>
      <div className={classes.wrap}>
        {renderTitle()}
        <p className={`prose ${classes.description}`}>{description}</p>
      </div>
    </>
  );
};