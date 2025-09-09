// ===== STEPS HEADER =====
// src/pages/course-structure-wizard/StepsHeader.tsx
import { ReactNode } from "react";

interface StepsHeaderProps {
  title: ReactNode;
  description: string;
}

export const StepsHeader = ({ title, description }: StepsHeaderProps) => {
  return (
    <header className="mb-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
        {title}
      </h3>
      <p className="text-gray-600">{description}</p>
    </header>
  );
};

export default StepsHeader;