// ============================================
// src/pages/auth/update-password/components/PasswordRequirements.tsx
// ============================================

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Check, X } from "lucide-react";
import { getPasswordRequirements } from "../utils/updatePasswordValidation";

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password }) => {
  const requirements = getPasswordRequirements();
  
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription>
        <strong>Wymagania hasła:</strong>
        <ul className="mt-2 space-y-1">
          {requirements.map((req, index) => {
            const isMet = password ? req.check(password) : false;
            const isRequired = index < 2; // Pierwsze dwa są wymagane
            
            return (
              <li 
                key={index} 
                className={`flex items-center text-sm ${
                  isMet ? 'text-green-700' : isRequired ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                {isMet ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <X className="h-3 w-3 mr-1" />
                )}
                {req.text}
                {isRequired && ' (wymagane)'}
              </li>
            );
          })}
        </ul>
      </AlertDescription>
    </Alert>
  );
};