// src/pages/teacher/course-structure-wizard/courseStructureWizard.constants.ts

import { LLMOperation } from "@/utility/llmFormWizard";

// ===== TYPES =====
export type CourseType = 'matura' | 'academic' | 'professional' | 'hobby' | 'certification';

export interface CourseFormData {
  courseType?: CourseType;
  subject?: string;
  level?: string;
  duration?: string;
  curriculum?: string;
  courseTitle?: string;
  description?: string;
  objectives?: string[];
  targetAudience?: string;
  prerequisites?: string[];
  estimatedHours?: number;
  topicsCount?: number;
  topicsPerWeek?: number;
  structure?: any[];
  summary?: {
    totalWeeks: number;
    totalTopics: number;
  };
}

// ===== FORM SCHEMA =====
export const COURSE_STRUCTURE_SCHEMA = {
  id: "course-structure-wizard",
  title: "Kreator struktury kursu",
  schema: {
    step1: {
      title: "Podstawowe informacje o kursie",
      type: "object",
      properties: {
        courseType: {
          type: "select",
          title: "Typ kursu",
          options: [
            { value: "matura", label: "Kurs maturalny" },
            { value: "academic", label: "Kurs akademicki" },
            { value: "professional", label: "Kurs zawodowy" },
            { value: "hobby", label: "Kurs hobbystyczny" },
            { value: "certification", label: "Kurs certyfikacyjny" },
          ],
        },
        subject: {
          type: "text",
          title: "Przedmiot/Dziedzina",
          placeholder: "np. Matematyka, Programowanie Python, Język angielski",
        },
        level: {
          type: "select",
          title: "Poziom kursu",
          options: [
            { value: "basic", label: "Podstawowy" },
            { value: "extended", label: "Rozszerzony" },
            { value: "beginner", label: "Początkujący" },
            { value: "intermediate", label: "Średniozaawansowany" },
            { value: "advanced", label: "Zaawansowany" },
          ],
        },
        duration: {
          type: "select",
          title: "Planowany czas trwania",
          options: [
            { value: "1month", label: "1 miesiąc" },
            { value: "3months", label: "3 miesiące" },
            { value: "6months", label: "6 miesięcy" },
            { value: "1year", label: "1 rok" },
            { value: "2years", label: "2 lata" },
          ],
        },
        curriculum: {
          type: "textarea",
          title: "Podstawa programowa",
          placeholder: "Opcjonalnie - wklej podstawę programową",
        },
      },
      required: ["courseType", "subject", "level", "duration"],
    },
    step2: {
      title: "Analiza wymagań",
      type: "object",
      properties: {
        courseTitle: { type: "text", title: "Proponowany tytuł kursu", readOnly: true },
        description: { type: "textarea", title: "Opis kursu", readOnly: true },
        objectives: { type: "tags", title: "Cele kursu", readOnly: true },
        targetAudience: { type: "text", title: "Grupa docelowa", readOnly: true },
        prerequisites: { type: "tags", title: "Wymagania wstępne", readOnly: true },
        estimatedHours: { type: "number", title: "Szacowana liczba godzin", readOnly: true },
        topicsCount: { type: "number", title: "Liczba głównych tematów", readOnly: true },
      },
    },
    step3: {
      title: "Dostosowanie struktury",
      type: "object",
      properties: {
        courseTitle: {
          type: "text",
          title: "Tytuł kursu",
          placeholder: "np. Matematyka - Przygotowanie do matury",
        },
        description: {
          type: "textarea",
          title: "Opis kursu",
          rows: 4,
        },
        topicsPerWeek: {
          type: "number",
          title: "Liczba tematów na tydzień",
          min: 1,
          max: 7,
        },
      },
      required: ["courseTitle", "description", "topicsPerWeek"],
    },
    step4: {
      title: "Podgląd struktury",
      type: "object",
      properties: {
        structure: { type: "array", title: "Struktura kursu", readOnly: true },
      },
    },
    step5: {
      title: "Tworzenie kursu",
      type: "object",
      properties: {
        courseName: {
          type: "text",
          title: "Ostateczna nazwa kursu",
        },
        iconEmoji: {
          type: "text",
          title: "Emoji ikona",
          placeholder: "np. 📚 📐 🎓",
        },
        isPublished: {
          type: "checkbox",
          title: "Opublikuj od razu",
        },
      },
      required: ["courseName"],
    },
  },
};

// ===== LLM OPERATIONS =====
export const COURSE_ANALYSIS_OPERATION: LLMOperation = {
  id: "analyze-course-requirements",
  name: "Analiza wymagań kursu",
  config: {
    endpoint: "https://diesel-power-backend.onrender.com/api/chat",
  },
  prompt: {
    system: "Jesteś ekspertem od projektowania kursów edukacyjnych i programów nauczania.",
    user: `
Przeanalizuj wymagania dla kursu:
Typ: {{courseType}}
Przedmiot: {{subject}}
Poziom: {{level}}
Czas trwania: {{duration}}
{{#if curriculum}}
Podstawa programowa/Sylabus:
{{curriculum}}
{{/if}}

Wygeneruj JSON:
{
  "courseTitle": "<tytuł kursu odpowiedni do typu i poziomu>",
  "description": "<szczegółowy opis kursu 100-200 słów>",
  "objectives": ["cel1", "cel2", "cel3", "cel4", "cel5"],
  "targetAudience": "<opis grupy docelowej>",
  "prerequisites": ["wymaganie1", "wymaganie2"],
  "estimatedHours": <liczba godzin>,
  "topicsCount": <liczba głównych tematów>
}

Wymagania:
{{#if curriculum}}
- ŚCIŚLE przestrzegaj podanej podstawy programowej/sylabusa
- Uwzględnij wszystkie wymagania szczegółowe
{{/if}}
- Dla kursów maturalnych: zgodność z wymaganiami egzaminacyjnymi
- CourseTitle: profesjonalny i opisowy
- Description: zawiera zakres materiału i metodykę
- Objectives: 5-8 konkretnych, mierzalnych celów
- Prerequisites: realistyczne wymagania (może być pusta tablica)
- EstimatedHours: realistyczna liczba godzin
- TopicsCount: odpowiednia liczba tematów do czasu trwania
    `,
    responseFormat: "json",
  },
  inputMapping: (data) => ({
    courseType: data.courseType,
    subject: data.subject,
    level: data.level,
    duration: data.duration,
    curriculum: data.curriculum || "",
  }),
  outputMapping: (llmResult, currentData) => ({
    ...currentData,
    courseTitle: llmResult.courseTitle,
    description: llmResult.description,
    objectives: llmResult.objectives,
    targetAudience: llmResult.targetAudience,
    prerequisites: llmResult.prerequisites,
    estimatedHours: llmResult.estimatedHours,
    topicsCount: llmResult.topicsCount,
  }),
  validation: (result) =>
    !!(result.courseTitle && result.description && result.objectives && result.topicsCount),
};

export const STRUCTURE_GENERATION_OPERATION: LLMOperation = {
  id: "generate-course-structure",
  name: "Generowanie struktury kursu",
  config: {
    endpoint: "https://diesel-power-backend.onrender.com/api/chat",
  },
  prompt: {
    system: "Jesteś ekspertem od tworzenia programów nauczania. Tworzysz TYLKO listę tematów z tytułami i krótkimi opisami.",
    user: `
    Stwórz listę tematów dla kursu:
    
    Tytuł: {{courseTitle}}
    Opis: {{description}}
    Przedmiot: {{subject}}
    Poziom: {{level}}
    Typ: {{courseType}}
    Tematy na tydzień: {{topicsPerWeek}}
    {{#if curriculum}}
    Podstawa programowa:
    {{curriculum}}
    {{/if}}
    
    Wygeneruj TYLKO TEMATY - sam tytuł i krótki opis. NIE dodawaj ćwiczeń, quizów, materiałów.
    {{#if curriculum}}
    MUSISZ uwzględnić wszystkie zagadnienia z podstawy programowej.
    {{/if}}
    
    Wygeneruj JSON:
    {
      "structure": [
        {
          "weekNumber": 1,
          "topics": [
            {
              "title": "<tytuł tematu>",
              "description": "<krótki opis tematu - max 2 zdania>"
            }
          ]
        }
      ],
      "summary": {
        "totalWeeks": <liczba>,
        "totalTopics": <liczba>
      }
    }
    
    Wygeneruj 4-8 tygodni w zależności od kursu. Każdy tydzień ma {{topicsPerWeek}} tematów.
    Tematy powinny tworzyć logiczną progresję od podstaw do zaawansowanych.
    `,
    responseFormat: "json",
  },
  inputMapping: (data) => ({
    courseTitle: data.courseTitle,
    description: data.description,
    subject: data.subject,
    level: data.level,
    courseType: data.courseType,
    topicsPerWeek: data.topicsPerWeek,
    curriculum: data.curriculum || "",
  }),
  outputMapping: (llmResult, currentData) => ({
    ...currentData,
    structure: llmResult.structure,
    summary: llmResult.summary,
  }),
  validation: (result) =>
    !!(result.structure && Array.isArray(result.structure) && result.structure.length > 0),
};

// ===== VALIDATION RULES =====
export const COURSE_VALIDATION = {
  subject: {
    required: true,
    minLength: 3,
    maxLength: 100,
    errorMessage: "Przedmiot jest wymagany (3-100 znaków)",
  },
  courseTitle: {
    required: true,
    minLength: 5,
    maxLength: 200,
    errorMessage: "Tytuł jest wymagany (5-200 znaków)",
  },
  description: {
    required: true,
    minLength: 50,
    maxLength: 1000,
    errorMessage: "Opis jest wymagany (50-1000 znaków)",
  },
  topicsPerWeek: {
    required: true,
    min: 1,
    max: 7,
    errorMessage: "Liczba tematów na tydzień musi być między 1 a 7",
  },
};

// ===== UI TEXTS =====
export const COURSE_UI_TEXTS = {
  steps: {
    1: {
      title: "Jaki kurs chcesz stworzyć?",
      description:
        "Określ typ, przedmiot i poziom - AI stworzy kompletną strukturę kursu",
      button: "Analizuj wymagania",
      loading: "Analizuję wymagania...",
    },
    2: {
      title: "Analiza wymagań kursu",
      description: "AI przeanalizowała wymagania i zaproponowała parametry kursu",
      success: "✓ Analiza zakończona pomyślnie",
    },
    3: {
      title: "Podstawowe informacje o kursie",
      description: "Podaj tytuł, opis i tempo nauki",
      button: "Generuj tematy",
      loading: "Generuję tematy...",
      loadingInfo: "⚡ AI tworzy listę tematów kursu...",
    },
    4: {
      title: "Edycja struktury kursu",
      description: "Możesz dodać lub usunąć tematy przed utworzeniem kursu",
      info: "💡 Możesz dodawać i usuwać tematy. Po zapisaniu kursu będziesz mógł dodać materiały do każdego tematu.",
    },
    5: {
      title: "Tworzenie kursu",
      description:
        "Ostatnie poprawki przed utworzeniem kursu",
      saveInfo:
        "💾 Zostanie utworzony kurs z listą tematów. Materiały i quizy możesz dodać później.",
      button: "Utwórz kurs",
      loading: "Tworzę kurs...",
      success:
        "✓ Kurs został utworzony pomyślnie! Przekierowuję...",
    },
  },
  dashboard: {
    title: "Generator struktury kursu",
    description: "Twórz kompletne kursy z pomocą AI",
    wizardTitle: "Generator kursów AI",
    wizardDescription:
      "Stwórz pełną strukturę kursu w 5 krokach",
    features: [
      "Automatyczna analiza wymagań",
      "Generowanie listy tematów",
      "Podział na tygodnie",
      "Możliwość edycji struktury",
      "Zgodność z podstawą programową",
      "Progresja poziomu trudności",
    ],
  },
  errors: {
    subjectRequired: "Podaj przedmiot kursu",
    analysisError: "Błąd analizy wymagań:",
    generationError: "Błąd generowania struktury:",
    saveError: "Wystąpił błąd podczas tworzenia kursu",
    unexpectedError: "Wystąpił nieoczekiwany błąd",
  },
};

// ===== NAVIGATION PATHS =====
export const COURSE_PATHS = {
  dashboard: "/teacher/course-structure",
  step1: "/teacher/course-structure/step1",
  step2: "/teacher/course-structure/step2",
  step3: "/teacher/course-structure/step3",
  step4: "/teacher/course-structure/step4",
  step5: "/teacher/course-structure/step5",
  courses: "/teacher/courses",
};

// ===== COURSE TYPE CONFIGS =====
export const COURSE_TYPE_CONFIG: Record<CourseType, {
  defaultTopicsPerWeek?: number;
}> = {
  matura: {
    defaultTopicsPerWeek: 3,
  },
  academic: {
    defaultTopicsPerWeek: 2,
  },
  professional: {
    defaultTopicsPerWeek: 2,
  },
  hobby: {
    defaultTopicsPerWeek: 1,
  },
  certification: {
    defaultTopicsPerWeek: 3,
  },
};