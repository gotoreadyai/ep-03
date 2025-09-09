// ============================================
// src/pages/auth/register/components/PasswordStrengthIndicator.tsx
// ============================================

import React from "react";
import { getPasswordStrength } from "../utils/registrationValidation";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const strength = getPasswordStrength(password);
  
  if (!password) return null;
  
  const getColorClass = () => {
    switch (strength.color) {
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };
  
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">Siła hasła:</span>
        <span className={`text-xs font-medium ${
          strength.color === 'red' ? 'text-red-600' :
          strength.color === 'yellow' ? 'text-yellow-600' :
          strength.color === 'green' ? 'text-green-600' :
          'text-gray-600'
        }`}>
          {strength.label}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getColorClass()}`}
          style={{ width: `${(strength.score / 7) * 100}%` }}
        />
      </div>
    </div>
  );
};