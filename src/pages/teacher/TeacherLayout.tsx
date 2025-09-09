import type { PropsWithChildren } from "react";
import { useState } from "react";
import { TeacherMenu } from "./TeacherMenu";
import { Button } from "@/components/ui/button";
import { Menu as MenuIcon } from "lucide-react";

export const TeacherLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-stone-200 relative overflow-x-hidden">
      <div className="flex relative">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-purple-900/20 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            h-screen w-64 transform transition-transform duration-300 ease-in-out
            fixed left-0 top-0 z-50
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
            bg-background/95 backdrop-blur-md border-r border-purple-200/20
          `}
        >
          <TeacherMenu onClose={() => setIsMobileMenuOpen(false)} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-w-0 relative z-10">
          {/* Mobile Header */}
          <div className="sticky top-0 z-30 flex h-16 items-center border-b border-purple-200/20 bg-background/80 backdrop-blur-md px-4 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="mr-2 hover:bg-purple-100/20 hover:text-purple-700"
            >
              <MenuIcon className="h-6 w-6" />
            </Button>
            <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Smart Up    
            </span>
          </div>

          {/* Content */}
          {children}
        </main>
      </div>
    </div>
  );
};