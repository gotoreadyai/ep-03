// src/pages/student/StudentLayout.tsx
import type { PropsWithChildren } from "react";
import { useState, useEffect } from "react";
import { StudentMenu } from "./StudentMenu";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useStudentStats } from "./hooks";
import { Background } from "./student-layout/Background";
import { TopBar } from "./student-layout/TopBar";

export const StudentLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const { stats } = useStudentStats();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background effect */}
      <Background />

      <div className="flex relative">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            h-screen w-80 transform transition-transform duration-300 ease-in-out
            fixed left-0 top-0 z-50
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:w-72
            bg-card/95 backdrop-blur-xl border-r
          `}
        >
          <StudentMenu onClose={() => setIsMobileMenuOpen(false)} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 min-w-0 relative z-10">
          {/* Top Bar - Desktop - ZMIANA: fixed zamiast sticky */}
          <div className="fixed top-0 left-72 right-0 z-30 hidden lg:block">
            <TopBar stats={stats} theme={theme} onToggleTheme={toggleTheme} />
          </div>

          {/* Mobile Header */}
          <div className="sticky top-0 z-30 flex h-16 items-center border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="mr-2"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Smart Up
            </span>
          </div>

          {/* Content with bottom padding for mobile nav - ZMIANA: dodanie pt-16 na desktop */}
          <div className="min-h-[calc(100vh-4rem)] pb-32 lg:pb-24 lg:pt-16">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - mobile i desktop */}
      <nav
        aria-label="Nawigacja dolna"
        className="fixed py-3.5 bottom-0 z-40 left-0 right-0 lg:left-72 bg-card/95 backdrop-blur-xl border-t"
      >
        <StudentMenu variant="bottom" />
      </nav>
    </div>
  );
};