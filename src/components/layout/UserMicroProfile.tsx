// src/components/layout/UserMicroProfile.tsx
import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Shield, GraduationCap, UserCog } from "lucide-react";

// Typy dla użytkownika zgodne z authProvider
interface User {
  id: string;
  email: string;
  full_name: string;
  vendor_id: number;
  role: "student" | "teacher" | "admin";
  is_active?: boolean;
  created_at?: string;
}

interface UserMicroProfileProps {
  className?: string;
  showRole?: boolean;
  showEmail?: boolean;
  compact?: boolean;
}

// NAMED EXPORT - właściwy sposób eksportu
export const UserMicroProfile: React.FC<UserMicroProfileProps> = ({
  className = "",
  showRole = true,
  showEmail = true,
  compact = false,
}) => {
  const { data: user, isLoading, error } = useGetIdentity<User>();

  // Ikona dla roli
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-3 w-3" />;
      case "teacher":
        return <UserCog className="h-3 w-3" />;
      case "student":
        return <GraduationCap className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  // Nazwa roli po polsku
  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "teacher":
        return "Nauczyciel";
      case "student":
        return "Uczeń";
      default:
        return "Użytkownik";
    }
  };

  // Kolor dla roli
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-purple-600 bg-purple-50";
      case "teacher":
        return "text-blue-600 bg-blue-50";
      case "student":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-3 p-3 ${className}`}>
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
          {showRole && <Skeleton className="h-3 w-16" />}
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div
        className={`flex items-center space-x-3 p-3 text-muted-foreground ${className}`}
      >
        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
          <User className="h-5 w-5 text-gray-400" />
        </div>
        <div className="text-sm">
          <div className="font-medium text-gray-500">Nie zalogowano</div>
          <div className="text-xs opacity-70">Brak danych użytkownika</div>
        </div>
      </div>
    );
  }

  // Wyciągnij inicjały
  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    const names = fullName.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user.full_name || user.email);

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 p-2 ${className}`}>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{user.full_name}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center space-x-3 px-4 pt-4 rounded-lg bg-white/50 backdrop-blur-sm border border-purple-100/20 ${className}`}
    >
      <Avatar className="h-12 w-12 ring-2 ring-purple-100 ring-offset-2">
        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 space-y-1">
        {/* Imię i nazwisko */}
        <div
          className="font-semibold text-gray-900 truncate"
          title={user.full_name}
        >
          {user.full_name}
        </div>

        {/* Email */}
        {showEmail && user.email && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Mail className="h-3 w-3" />
            <span className="truncate" title={user.email}>
              {user.email}
            </span>
          </div>
        )}

        {/* Rola */}
        {showRole && user.role && (
          <div className="inline-flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full text-xs font-medium ${getRoleColor(
                user.role
              )}`}
            >
              {getRoleIcon(user.role)}
              {getRoleName(user.role)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Opcjonalnie: default export jeśli jest potrzebny
export default UserMicroProfile;
