
// ============================================
// src/utility/auth/authProvider.ts
// CZYSTY ADAPTER - ZERO LOGIKI
// ============================================

import { AuthBindings } from "@refinedev/core";
import { loginService } from "@/pages/auth/login/services/loginService";
import { registerService } from "@/pages/auth/register/services/registerService";
import { forgotPasswordService } from "@/pages/auth/forgot-password/services/forgotPasswordService";
import { updatePasswordService } from "@/pages/auth/update-password/services/updatePasswordService";
import { sessionService } from "./sessionService";
import { userCache } from "./userCache";

export const authProvider: AuthBindings = {
  login: async ({ email, password }) => {
    const result = await loginService.login(email, password);
    if (result.success) {
      await userCache.refresh();
    }
    return result;
  },

  logout: async () => {
    return await sessionService.logout();
  },

  check: async () => {
    return await sessionService.check();
  },

  getIdentity: async () => {
    return await userCache.get();
  },

  getPermissions: async () => {
    const user = await userCache.get();
    return user?.role || null;
  },

  register: async ({ email, password, name }) => {
    return await registerService.registerForRefine(email, password, name);
  },

  forgotPassword: async ({ email }) => {
    return await forgotPasswordService.sendResetEmailForRefine(email);
  },

  updatePassword: async ({ password }) => {
    const result = await updatePasswordService.updatePasswordForRefine(password);
    if (result.success) {
      await userCache.clear();
    }
    return result;
  },

  onError: async (error) => {
    return await sessionService.handleError(error);
  }
};