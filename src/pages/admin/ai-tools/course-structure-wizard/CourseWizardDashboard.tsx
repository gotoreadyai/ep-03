// src/pages/teacher/ai-tools/course-structure-wizard/CourseWizardDashboard.tsx
import { Link } from "react-router-dom";
import { Wand, ChevronRight } from "lucide-react";

export function CourseWizardDashboard() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <header className="flex items-center gap-3 mb-6">
        <Wand className="w-6 h-6" />
        <h1 className="text-2xl font-semibold">Generator kursów — panel</h1>
      </header>

      <div className="space-y-4">
        <p className="text-sm text-zinc-600">
          Ten kreator w 2 krokach wygeneruje szkic Twojego kursu przy pomocy LLM.
        </p>

        <div className="rounded-2xl border p-4 shadow-sm bg-white">
          <h2 className="font-medium mb-2">Szybki start</h2>
          <ol className="list-decimal list-inside text-sm text-zinc-700 space-y-1">
            <li>W kroku 1 przekaż podstawy (temat, grupa docelowa, poziom).</li>
            <li>W kroku 2 doprecyzuj strukturę modułów i lekcji.</li>
          </ol>

          <Link
            to="/admin/course-structure/step1"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-black text-white text-sm hover:opacity-90"
          >
            Rozpocznij
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
