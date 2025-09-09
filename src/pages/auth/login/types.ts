// ============================================
// src/pages/auth/login/types.ts
// ============================================

export interface LoginUser {
    id: string;
    email: string;
    full_name: string;
    role: 'student' | 'teacher' | 'admin';
    vendor_id?: number;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface LoginFormProps {
    email: string;
    password: string;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    isLoading: boolean;
    error: string | null;
    handleSubmit: (e: React.FormEvent) => void;
    isFormValid: boolean;
    showVerifiedMessage?: boolean;
    showPasswordChangedMessage?: boolean;
  }