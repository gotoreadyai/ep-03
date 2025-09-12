import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useNavigate } from "react-router";
import { Progress } from "@/components/ui/progress";

interface StepsHeroProps {
  step: number;
}

export const StepsHero = ({ step }: StepsHeroProps) => {
  const navigate = useNavigate();
  const progress = (step / 5) * 100;
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 hover:bg-gray-100"
        onClick={() => navigate("/teacher/quiz-wizard")}
      >
        <X className="h-5 w-5" />
      </Button>
      
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-8 space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight">KREATOR QUIZÓW</h1>
          <h2 className="text-2xl font-light">
            Twórzmy razem <span className="font-bold">sprawdzian wiedzy</span>
          </h2>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Krok {step} z 5</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-blue-300" />
        </div>
      </div>
    </>
  );
};

export default StepsHero;