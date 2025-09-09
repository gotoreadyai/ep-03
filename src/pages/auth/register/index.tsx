// ============================================
// src/pages/auth/register/index.tsx
// MODUŁ REGISTER Z WŁASNYM LAZY LOADING
// ============================================

import React, { lazy, Suspense } from "react";
import { Route } from "react-router-dom";

// Lazy load głównego komponentu
const RegisterFlow = lazy(() => import('./RegisterFlow'));

// Własny fallback dla modułu register
const RegisterLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Przygotowywanie rejestracji...</p>
    </div>
  </div>
);

// Eksport modułu - BEZ FUNKCJI, TYLKO JSX
export const RegisterModule = (
  <Route 
    path="/register/*" 
    element={
      <Suspense fallback={<RegisterLoadingFallback />}>
        <RegisterFlow />
      </Suspense>
    } 
  />
);