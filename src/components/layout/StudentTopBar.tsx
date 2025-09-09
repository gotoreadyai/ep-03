// src/components/layout/StudentTopBar.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, Coins, Flame, Bell } from "lucide-react";
import { useStudentStats } from "@/pages/student/hooks";

interface StudentTopBarProps {
  onMenuClick: () => void;
}

export const StudentTopBar: React.FC<StudentTopBarProps> = ({ onMenuClick }) => {
  const { stats } = useStudentStats();

  return (
    <div className="sticky top-0 z-30 border-b border-purple-200/20 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden hover:bg-purple-100/20 hover:text-purple-700"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent lg:hidden">
            Smart Up    
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Punkty */}
          <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full">
            <Coins className="w-4 h-4 text-purple-700" />
            <span className="font-bold text-purple-700 text-sm">{stats.points}</span>
          </div>
          
          {/* Seria dni */}
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full">
            <Flame className="w-4 h-4 text-orange-600" />
            <span className="font-bold text-orange-600 text-sm">{stats.streak}</span>
          </div>
          
          {/* Powiadomienia */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
        </div>
      </div>
    </div>
  );
};