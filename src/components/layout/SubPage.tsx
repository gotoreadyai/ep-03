// components/FlexBox.tsx
import { ReactNode } from "react";

interface NarrowColProps {
  children: ReactNode;
}

export const SubPage = ({ children }: NarrowColProps) => {
  return <div className="p-2 md:p-12 space-y-6 max-w-8xl mx-auto">{children}</div>;
};
