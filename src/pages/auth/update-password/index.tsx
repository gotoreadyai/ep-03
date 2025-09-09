// ============================================
// src/pages/auth/update-password/index.tsx
// MODUŁ UPDATE PASSWORD Z WŁASNYM LAZY LOADING
// ============================================

import React, { lazy, Suspense } from "react";
import { Route } from "react-router-dom";

// Lazy load głównego komponentu
const UpdatePasswordPage = lazy(() => import('./UpdatePasswordPage'));

// Własny fallback dla modułu update password
const UpdatePasswordLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Weryfikacja linku resetowania...</p>
    </div>
  </div>
);

// Eksport modułu - BEZ FUNKCJI, TYLKO JSX
export const UpdatePasswordModule = (
  <Route 
    path="/update-password" 
    element={
      <Suspense fallback={<UpdatePasswordLoadingFallback />}>
        <UpdatePasswordPage />
      </Suspense>
    } 
  />
);