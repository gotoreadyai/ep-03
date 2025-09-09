/* path: src/pages/studentLessons/hooks/useLocalJson.ts */
import React from "react";

export const useLocalJson = <T,>(key: string, init: T) => {
  const [state, setState] = React.useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : init;
    } catch {
      return init;
    }
  });
  React.useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.error("Błąd zapisu do localStorage:", err);
    }
  }, [key, state]);
  return [state, setState] as const;
};
