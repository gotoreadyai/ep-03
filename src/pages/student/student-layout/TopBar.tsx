// src/pages/student/student-layout/TopBar.tsx
import { useState, useMemo } from "react";
import { Bell, Zap, ChevronDown, User,  LogOut, Sun, Moon } from "lucide-react";
import { useGetIdentity, useLogout } from "@refinedev/core";

interface TopBarProps {
  stats: {
    points: number;
    idle_rate: number;
    level: number;
  };
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ stats, theme, onToggleTheme }) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { data: user } = useGetIdentity<any>();
  const { mutate: logout } = useLogout();

  // Formatuj punkty - zaokrąglij do liczby całkowitej dla wyświetlania
  const displayPoints = useMemo(() => Math.floor(stats.points), [stats.points]);

  return (
    <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b shadow-sm hidden lg:block">
      <div className="mx-auto max-w-6xl h-full px-4 lg:px-8 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold truncate">Dashboard</h1>
            <p className="text-xs text-muted-foreground truncate">
              Witaj, {user?.full_name?.split(" ")[0]}!
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 lg:gap-3">
          <button
            className="relative p-2.5 rounded-xl hover:bg-muted focus-ring h-11 w-11 grid place-items-center"
            aria-label="Powiadomienia"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </button>

          <div className="flex items-center gap-2 px-3 lg:px-4 h-11 rounded-xl border bg-primary/10 border-primary/20">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
            <span className="font-semibold text-sm lg:text-base tabular-nums min-w-[3ch] text-right">
              {displayPoints.toLocaleString('pl-PL')}
            </span>
            <span className="hidden md:block text-xs text-primary">
              +{stats.idle_rate}/h
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 px-1.5 h-11 rounded-xl hover:bg-muted focus-ring"
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
            >
              <div className="relative">
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-white grid place-items-center font-bold">
                  {user?.full_name?.charAt(0) || "U"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-accent text-white text-[10px] lg:text-xs grid place-items-center border-2 border-card">
                  {stats.level}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            {profileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setProfileMenuOpen(false)}
                  aria-hidden="true"
                />
                <menu className="absolute right-0 mt-2 w-64 bg-card rounded-xl border shadow-soft-lg z-50 overflow-hidden">
                  <section className="p-4 border-b">
                    <p className="font-semibold truncate">{user?.full_name}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  </section>
                  <ul className="p-2">
                    <li>
                      <button
                        onClick={() => {
                          onToggleTheme();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 h-11 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
                      >
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        <span className="text-sm font-medium">{theme === "dark" ? "Tryb jasny" : "Tryb ciemny"}</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          window.location.href = "/student/profile";
                          setProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 h-11 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Profil</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          logout();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 h-11 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Wyloguj</span>
                      </button>
                    </li>
                  </ul>
                </menu>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};