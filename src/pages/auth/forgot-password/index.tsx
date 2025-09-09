// ============================================
// src/pages/auth/forgot-password/index.tsx
// MODUŁ FORGOT PASSWORD Z WŁASNYM LAZY LOADING
// ============================================

import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';

// Lazy load głównego komponentu
const ForgotPasswordPage = lazy(() => import('./ForgotPasswordPage'));

// Własny fallback dla modułu forgot password
const ForgotPasswordLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Ładowanie formularza resetowania...</p>
    </div>
  </div>
);

// Eksport modułu - BEZ FUNKCJI, TYLKO JSX
export const ForgotPasswordModule = (
  <Route 
    path="/forgot-password" 
    element={
      <Suspense fallback={<ForgotPasswordLoadingFallback />}>
        <ForgotPasswordPage />
      </Suspense>
    } 
  />
);