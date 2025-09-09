// src/pages/auth/login/index.tsx
// MODUŁ LOGIN Z WŁASNYM LAZY LOADING I DEBUGOWANIEM

import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";

console.log("1. Login index.tsx - ładowanie modułu");

// Lazy load głównego komponentu
const LoginPage = lazy(() => {
  console.log("2. Login - rozpoczęcie lazy load");
  return import('./LoginPage').then(module => {
    console.log("3. Login - moduł załadowany", module);
    return module;
  });
});

// Własny fallback dla modułu login
const LoginLoadingFallback = () => {
  console.log("4. Login - renderowanie fallback");
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Ładowanie logowania...</p>
      </div>
    </div>
  );
};

// Eksport modułu - BEZ FUNKCJI, TYLKO JSX
export const LoginModule = (
  <Route 
    path="/login" 
    element={
      <Suspense fallback={<LoginLoadingFallback />}>
        <LoginPage />
      </Suspense>
    } 
  />
);

console.log("5. Login module exported", LoginModule);