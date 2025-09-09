// components/FlexBox.tsx
import { ReactNode } from "react";

interface NarrowColProps {
  children: ReactNode;
}

export const NarrowCol = ({ children }: NarrowColProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Wielowarstwowe gradienty dla luksusowego efektu */}
      <div className="h-96 fixed top-0 w-full -rotate-1 scale-125">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 via-pink-300/15 to-purple-500/10" />
      </div>
      
      {/* Dodatkowe elementy dekoracyjne */}
      <div className="absolute top-20 -left-32 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-32 w-96 h-96 bg-gradient-to-tl from-purple-400/15 to-pink-400/15 rounded-full blur-3xl" />
      
      {/* Delikatne światło od góry */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-b from-pink-200/10 to-transparent" />
      
      {/* Główna zawartość */}
      <div className="w-full max-w-lg space-y-3 relative z-10">
        {/* Opcjonalna ramka z subtelnymi cieniami */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-300/5 to-pink-300/5 rounded-lg blur-md" />
          <div className="relative bg-background/80 backdrop-blur-sm rounded-lg shadow-xl shadow-purple-200/20 border border-purple-200/20 p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};