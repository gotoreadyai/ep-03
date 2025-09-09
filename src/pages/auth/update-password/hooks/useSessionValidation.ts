// ============================================
// src/pages/auth/update-password/hooks/useSessionValidation.ts
// ============================================

import React from "react";
import { useNavigate } from "react-router-dom";
import { supabaseClient } from "@/utility";
import { SessionValidation } from "../types";


export const useSessionValidation = (): SessionValidation => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = React.useState(true);
  const [isValid, setIsValid] = React.useState(false);
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabaseClient.auth.getSession();
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get("type");

        if (!data.session && type !== "recovery") {
          setIsValid(false);
          setError("Link wygasł lub jest nieprawidłowy");
          setTimeout(() => navigate("/forgot-password"), 3000);
        } else {
          setIsValid(true);
        }
      } catch (error) {
        setIsValid(false);
        setError("Błąd weryfikacji sesji");
      } finally {
        setIsChecking(false);
      }
    };

    checkSession();
  }, [navigate]);

  return {
    isChecking,
    isValid,
    error
  };
};
