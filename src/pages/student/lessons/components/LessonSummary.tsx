// src/pages/student/lessons/components/LessonSummary.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Clock, CheckCircle, BookOpen, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface LessonSummaryProps {
  lessonTitle: string;
  courseId: string;
  timeSpent: number;
  sectionsCount: number;
  quizzesCompleted: number;
  pointsEarned: number;
  nextLessonPath?: string;
}

export const LessonSummary: React.FC<LessonSummaryProps> = ({
  lessonTitle,
  courseId,
  timeSpent,
  sectionsCount,
  quizzesCompleted,
  pointsEarned,
  nextLessonPath
}) => {
  const navigate = useNavigate();
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins} min ${secs} s` : `${secs} s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-20 flex items-center justify-center p-4 bg-black/50"
    >
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl">
        {/* Ikona sukcesu */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold">Lekcja ukończona! 🎉</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {lessonTitle}
          </p>
        </div>

        {/* Punkty */}
        <div className="rounded-xl bg-primary/10 p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 text-3xl font-bold text-primary">
            <Zap className="w-6 h-6" />
            +{pointsEarned} punktów
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            za ukończenie materiału
          </p>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            <p className="text-sm font-medium">{formatTime(timeSpent)}</p>
            <p className="text-xs text-muted-foreground">Czas nauki</p>
          </div>
          
          <div className="text-center">
            <BookOpen className="w-5 h-5 mx-auto mb-1 text-purple-600" />
            <p className="text-sm font-medium">{sectionsCount}</p>
            <p className="text-xs text-muted-foreground">Sekcji</p>
          </div>
          
          <div className="text-center">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
            <p className="text-sm font-medium">{quizzesCompleted}</p>
            <p className="text-xs text-muted-foreground">Pytań</p>
          </div>
        </div>

        {/* Akcje */}
        <div className="flex gap-3">
          {nextLessonPath ? (
            <button
              onClick={() => navigate(nextLessonPath)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-primary-foreground hover:bg-primary/90"
            >
              Następna lekcja
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => navigate(`/student/courses/${courseId}`)}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-primary-foreground hover:bg-primary/90"
            >
              Wróć do kursu
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};