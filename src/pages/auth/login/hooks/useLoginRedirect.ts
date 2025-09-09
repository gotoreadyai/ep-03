// ============================================
// src/pages/auth/login/hooks/useLoginRedirect.ts
// ============================================

import { LoginUser } from "../types";

export const useLoginRedirect = (
  isAuthenticated: boolean | undefined, 
  user: LoginUser | null | undefined
) => {
  if (!isAuthenticated || !user) {
    return { shouldRedirect: false, redirectPath: "/" };
  }

  const redirectPath = user.role ? `/${user.role}` : "/profiles";
  
  return {
    shouldRedirect: true,
    redirectPath
  };
};