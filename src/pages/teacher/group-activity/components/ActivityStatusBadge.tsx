import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Circle } from "lucide-react";

interface ActivityStatusBadgeProps {
  status: "completed" | "in-progress" | "not-started";
  size?: "sm" | "default";
}

export const ActivityStatusBadge = ({ status, size = "default" }: ActivityStatusBadgeProps) => {
  const config = {
    completed: {
      label: "Ukończone",
      variant: "default" as const,
      className: "bg-green-600 hover:bg-green-700",
      icon: CheckCircle2,
    },
    "in-progress": {
      label: "W trakcie",
      variant: "default" as const,
      className: "bg-blue-600 hover:bg-blue-700",
      icon: Clock,
    },
    "not-started": {
      label: "Nierozpoczęte",
      variant: "secondary" as const,
      className: "",
      icon: Circle,
    },
  };

  const { label, variant, className, icon: Icon } = config[status];

  return (
    <Badge variant={variant} className={`${className} ${size === "sm" ? "text-xs" : ""}`}>
      <Icon className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"} mr-1`} />
      {label}
    </Badge>
  );
};