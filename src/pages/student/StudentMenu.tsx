import React from "react";
import { useLogout, useGetIdentity } from "@refinedev/core";
import { NavLink, useLocation } from "react-router-dom";
import {
  LogOut,
  GraduationCap,
  X,
  Home,
  Gamepad2,
  Trophy,
  Award,
  User,
  Zap,
  Flame,
} from "lucide-react";
import { cn } from "@/utility";
import { Button, ScrollArea, Separator } from "@/components/ui";
import { useStudentStats } from "./hooks";

interface StudentMenuProps {
  onClose?: () => void;
  variant?: "sidebar" | "bottom";
}

export const StudentMenu: React.FC<StudentMenuProps> = ({ onClose, variant = "sidebar" }) => {
  const { mutate: logout } = useLogout();
  const { data: user } = useGetIdentity<any>();
  const location = useLocation();
  const { stats } = useStudentStats();

  const menuItems = [
    { path: "/student/dashboard", label: "Główna", icon: Home },
    { path: "/student/gamification", label: "Ulepszenia", icon: Gamepad2 },
    { path: "/student/leaderboard", label: "Ranking", icon: Trophy },
    { path: "/student/achievements", label: "Osiągnięcia", icon: Award },
    { path: "/student/profile", label: "Profil", icon: User },
  ];

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  // Wariant dolnej nawigacji (mobile)
  if (variant === "bottom") {
    return (
      <div className="grid grid-cols-5 gap-1 p-1.5">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center justify-center gap-1 rounded-lg p-3 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[11px] font-medium">{item.label}</span>
              {isActive && (
                <i
                  aria-hidden
                  className="pointer-events-none absolute inset-x-6 -bottom-[3px] h-1 rounded-full bg-primary/70"
                />
              )}
            </NavLink>
          );
        })}
      </div>
    );
  }

  // Wariant sidebar (desktop i mobile drawer)
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="h-16 px-6 border-b relative grid place-items-center justify-start overflow-hidden">
        <i aria-hidden className="absolute -right-10 -top-10 w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rotate-45" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-white grid place-items-center shadow">
            <GraduationCap className="w-5 h-5" />
          </div>
          <strong className="text-lg">Smart Up</strong>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* User Card */}
      <section className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary grid place-items-center font-bold">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary text-white text-xs grid place-items-center font-bold">
              {stats.level}
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{user?.full_name}</p>
            <p className="text-sm text-muted-foreground">
              Poziom {stats.level} • {stats.streak} dni
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 -mt-2 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <article className="rounded-xl border p-3 bg-primary/5 border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Punkty</span>
            </div>
            <p className="text-lg font-bold">{Math.floor(stats.points)}</p>
            <p className="text-xs text-primary">+{stats.idle_rate}/h</p>
          </article>
          <article className="rounded-xl border p-3 bg-destructive/5 border-destructive/10">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Seria</span>
            </div>
            <p className="text-lg font-bold">{stats.streak}</p>
            <p className="text-xs text-destructive">dni z rzędu</p>
          </article>
        </div>
      </section>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  "relative w-full flex items-center gap-3 px-4 h-11 rounded-xl transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <Separator />
      <footer className="p-4 space-y-3">
        {/* Level Progress */}
        <div className="px-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Poziom {stats.level}</span>
            <span>Poziom {stats.level + 1}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
              style={{ width: `${Math.max(0, Math.min(100, (stats.points % 100)))}%` }}
            />
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            logout();
            if (onClose) onClose();
          }}
          className="w-full justify-center text-destructive border-destructive/30 bg-destructive/5 hover:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Wyloguj
        </Button>
      </footer>
    </div>
  );
};