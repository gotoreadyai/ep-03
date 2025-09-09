/* path: src/pages/studentLessons/hooks/useLiveRegion.ts */
import React from "react";

export const useLiveRegion = () => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const say = (msg: string) => {
    if (!ref.current) return;
    ref.current.textContent = "";
    setTimeout(() => ref.current && (ref.current.textContent = msg), 30);
  };
  return { ref, say };
};
