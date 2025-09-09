import { LLMOperation } from "@/utility/llmFormWizard";

// ===== FORM SCHEMA =====
export const EDUCATIONAL_MATERIAL_SCHEMA = {
  id: "educational-material-wizard",
  title: "Kreator materiałów edukacyjnych",
  schema: {
    step1: {
      title: "Podstawowe informacje",
      type: "object",
      properties: {
        subject: {
          type: "text",
          title: "Temat materiału",
          placeholder: "np. Wprowadzenie do programowania w Python",
        },
        targetLevel: {
          type: "select",
          title: "Poziom zaawansowania",
          options: [
            { value: "beginner", label: "Początkujący" },
            { value: "intermediate", label: "Średniozaawansowany" },
            { value: "advanced", label: "Zaawansowany" },
          ],
        },
        ageGroup: {
          type: "select",
          title: "Grupa wiekowa",
          options: [
            { value: "7-10", label: "7-10 lat (szkoła podstawowa)" },
            { value: "11-14", label: "11-14 lat (klasy 4-8)" },
            { value: "15-18", label: "15-18 lat (szkoła średnia)" },
            { value: "18+", label: "18+ (dorośli)" },
          ],
        },
      },
      required: ["subject", "targetLevel", "ageGroup"],
    },
    step2: {
      title: "Analiza tematu",
      type: "object",
      properties: {
        keyTopics: {
          type: "tags",
          title: "Kluczowe zagadnienia",
          readOnly: true,
        },
        learningObjectives: {
          type: "textarea",
          title: "Cele nauczania",
          readOnly: true,
        },
        prerequisites: {
          type: "tags",
          title: "Wymagania wstępne",
          readOnly: true,
        },
        estimatedDuration: {
          type: "number",
          title: "Szacowany czas (min)",
          readOnly: true,
        },
      },
    },
    step3: {
      title: "Dostosowanie celów",
      type: "object",
      properties: {
        learningObjectives: {
          type: "textarea",
          title: "Cele nauczania (edytowalne)",
          placeholder: "Dostosuj cele nauczania...",
          rows: 6,
        },
        materialType: {
          type: "select",
          title: "Typ materiału",
          options: [
            {
              value: "lesson",
              label: "Lekcja z teorią (w kontekscie materiałów źródłowych)",
            },
            { value: "source_material", label: "Materiały źródłowe" },
            {
              value: "context",
              label: "Dane wejściowe - naprowadzamy na obszar tematu",
            },
          ],
        },
      },
      required: ["learningObjectives", "materialType"],
    },
    step4: {
      title: "Podgląd materiału",
      type: "object",
      properties: {
        title: { type: "text", title: "Tytuł materiału", readOnly: true },
        content: { type: "textarea", title: "Treść materiału", readOnly: true },
      },
    },
    step5: {
      title: "Dodaj pytania kontrolne",
      type: "object",
      properties: {
        addQuizzes: { type: "boolean", title: "Dodać pytania kontrolne?" },
        quizContent: {
          type: "textarea",
          title: "Pytania kontrolne",
          placeholder: "Tutaj dodasz pytania w formacie YAML...",
        },
      },
    },
    step6: {
      title: "Finalizacja",
      type: "object",
      properties: {
        courseId: {
          type: "select",
          title: "Wybierz kurs",
          placeholder: "Wybierz kurs...",
        },
        topicId: {
          type: "select",
          title: "Wybierz temat",
          placeholder: "Najpierw wybierz kurs...",
        },
        activityTitle: {
          type: "text",
          title: "Tytuł aktywności",
          placeholder: "np. Wprowadzenie do zmiennych",
        },
        activityType: {
          type: "select",
          title: "Typ aktywności",
          options: [
            { value: "material", label: "Materiał edukacyjny" },
            { value: "quiz", label: "Quiz sprawdzający" },
          ],
        },
        content: {
          type: "textarea",
          title: "Treść materiału",
          placeholder: "Edytuj wygenerowaną treść...",
          rows: 15,
        },
        duration: {
          type: "number",
          title: "Czas trwania (min)",
          placeholder: "15",
        },
      },
      required: [
        "courseId",
        "topicId",
        "activityTitle",
        "activityType",
        "content",
      ],
    },
  },
};

// ===== LLM OPERATIONS =====
export const TOPIC_ANALYSIS_OPERATION: LLMOperation = {
  id: "analyze-topic",
  name: "Analiza tematu edukacyjnego",
  config: {
    endpoint: "https://diesel-power-backend.onrender.com/api/chat",
  },
  prompt: {
    system:
      "Jesteś ekspertem od edukacji i tworzenia materiałów dydaktycznych w metodyce ODKRYWCZEJ. Analizujesz tematy pod kątem tworzenia interaktywnych materiałów z pytaniami kontrolnymi.",
    user: 'Przeanalizuj temat edukacyjny i zaplanuj strukturę materiału w metodyce ODKRYWCZEJ:\n\nTemat: {{subject}}\nPoziom: {{targetLevel}}\nGrupa wiekowa: {{ageGroup}}\n\nWygeneruj JSON z planem materiału:\n{\n  "keyTopics": ["temat1", "temat2", "temat3", "temat4", "temat5"],\n  "learningObjectives": "<szczegółowe cele nauczania - co dokładnie uczeń będzie umiał po przejściu materiału>",\n  "prerequisites": ["wymaganie1", "wymaganie2"],\n  "estimatedDuration": <liczba minut>\n}\n\nWAŻNE WYMAGANIA:\n1. KeyTopics (5-7 tematów):\n   - Każdy temat = osobna sekcja w materiale\n   - Uporządkuj od podstaw do zaawansowanych\n   - Każdy temat musi być na tyle konkretny, aby można było stworzyć pytanie kontrolne\n   \n2. LearningObjectives (150-250 słów):\n   - Konkretne, mierzalne umiejętności\n   - Użyj czasowników: "będzie potrafił", "zrozumie", "nauczy się"\n   - Uwzględnij zarówno wiedzę teoretyczną jak i praktyczne zastosowanie\n   \n3. Prerequisites:\n   - Dla początkujących: może być puste []\n   - Dla średniozaawansowanych: 2-3 wymagania\n   - Dla zaawansowanych: 3-5 wymagań\n   \n4. EstimatedDuration:\n   - Początkujący: 20-40 minut\n   - Średniozaawansowany: 30-60 minut  \n   - Zaawansowany: 45-90 minut\n   - Uwzględnij czas na przemyślenie pytań kontrolnych',
    responseFormat: "json",
  },
  inputMapping: (data) => ({
    subject: data.subject,
    targetLevel: data.targetLevel,
    ageGroup: data.ageGroup,
  }),
  outputMapping: (llmResult, currentData) => ({
    ...currentData,
    keyTopics: llmResult.keyTopics,
    learningObjectives: llmResult.learningObjectives,
    prerequisites: llmResult.prerequisites,
    estimatedDuration: llmResult.estimatedDuration,
  }),
  validation: (result) =>
    !!(
      result.keyTopics &&
      Array.isArray(result.keyTopics) &&
      result.keyTopics.length >= 3 &&
      result.learningObjectives &&
      result.estimatedDuration
    ),
};

export const MATERIAL_GENERATION_OPERATION: LLMOperation = {
  id: "generate-material",
  name: "Generowanie materiału edukacyjnego",
  config: {
    endpoint: "https://diesel-power-backend.onrender.com/api/chat",
  },
  prompt: {
    system:
      "Jesteś doświadczonym nauczycielem tworzącym angażujące materiały edukacyjne w metodzie ODKRYWCZEJ. Nie używaj metodyki podawczej!!!, bazując na technice Feynmana.",
    user: `Wygeneruj materiał edukacyjny na podstawie danych:

Dane wejściowe:
- Temat: {{subject}}
- Poziom: {{targetLevel}}
- Grupa wiekowa: {{ageGroup}}
- Cele nauczania: {{learningObjectives}}
- Typ materiału: {{materialType}}
- Kluczowe zagadnienia: {{keyTopics}}

TYPY MATERIAŁÓW:

1. Jeśli materialType = "lesson" (Lekcja z teorią w kontekscie materiałów źródłowych):
   - Wyjaśnij teorię odwołując się do praktycznych źródeł
   - Pokazuj jak teoria łączy się z rzeczywistymi materiałami
   - Używaj przykładów z dokumentacji, książek, artykułów

2. Jeśli materialType = "source_material" (Materiały źródłowe):
   - Skoncentruj się na analizie konkretnych materiałów
   - Omów fragmenty kodu, dokumentacji, przykłady
   - Wyjaśnij jak czytać i interpretować źródła

3. Jeśli materialType = "context" (Dane wejściowe - naprowadzanie):
   - Używaj przykładów z dokumentacji, książek, artykułów
   - Wprowadź ucznia w temat od podstaw
   - Wyjaśnij kontekst i tło zagadnienia z wykorzystaniem metodyki ODKRYWCZEJ,
   - Przygotuj grunt pod głębsze zrozumienie

STRUKTURA MATERIAŁU:
1. Użyj nagłówków ## dla każdej sekcji (NIE #, tylko ##)
2. Stwórz 4-6 sekcji odpowiadających kluczowym zagadnieniom
3. Każda sekcja powinna mieć 200-400 słów, wprowadzenie i podsumowanie max 100-150 słow
4. Używaj list, przykładów, pogrubień dla lepszej czytelności
5. NIE DODAWAJ sekcji z ćwiczeniami - to osobne moduły w systemie

KRYTYCZNE: Zwróć TYLKO czysty JSON bez żadnych dodatkowych znaków, bez bloków kodu markdown:
{
  "title": "<atrakcyjny tytuł max 80 znaków>",
  "content": "<cały materiał w Markdown z sekcjami ##>"
}

DOSTOSOWANIE DO WIEKU:
- 7-10 lat: Prosty język, dużo przykładów, krótkie zdania
- 11-14 lat: Średni poziom, ciekawostki, przystępne wyjaśnienia
- 15-18 lat: Bardziej złożony język, praktyczne zastosowania
- 18+: Profesjonalny język, głęboka analiza`,
    responseFormat: "json",
  },
  inputMapping: (data) => ({
    subject: data.subject,
    targetLevel: data.targetLevel,
    ageGroup: data.ageGroup,
    learningObjectives: data.learningObjectives,
    materialType: data.materialType,
    keyTopics: Array.isArray(data.keyTopics)
      ? data.keyTopics.join(", ")
      : data.keyTopics,
  }),
  outputMapping: (llmResult, currentData) => {
    console.log("Output mapping - received llmResult:", llmResult);

    // Usuń sekcje z ćwiczeniami i podsumowaniem jeśli się pojawią
    let content = llmResult.content;
    if (content) {
      // Usuń sekcje ćwiczeń
      content = content.replace(/##\s*Ćwiczenia[\s\S]*?(?=##|$)/gi, '');
      content = content.replace(/##\s*Zadania[\s\S]*?(?=##|$)/gi, '');
      content = content.replace(/##\s*Sprawdź swoją wiedzę[\s\S]*?(?=##|$)/gi, '');
      
      // Usuń sekcje podsumowania
      content = content.replace(/##\s*Podsumowanie[\s\S]*?(?=##|$)/gi, '');
      content = content.replace(/##\s*Zakończenie[\s\S]*?(?=##|$)/gi, '');
      
      // Usuń końcowe białe znaki
      content = content.trim();
    }

    const mappedData = {
      ...currentData,
      title: llmResult.title,
      content: content,
    };

    console.log("Output mapping - mapped data:", mappedData);
    return mappedData;
  },
  validation: (result) => {
    console.log("Validating LLM result:", result);

    // Sprawdź obecność wszystkich pól
    if (!result.title) {
      console.error("Validation failed: missing title");
      return false;
    }
    if (!result.content) {
      console.error("Validation failed: missing content");
      return false;
    }

    // Sprawdź nagłówki sekcji
    const headerMatches = result.content.match(/^##\s+/gm);
    if (!headerMatches || headerMatches.length < 4) {
      console.error(
        `Validation failed: not enough sections (found ${
          headerMatches?.length || 0
        }, need at least 4)`
      );
      return false;
    }

    console.log("Validation passed!");
    return true;
  },
};

// ===== VALIDATION RULES =====
export const MATERIAL_VALIDATION = {
  subject: {
    required: true,
    minLength: 5,
    maxLength: 200,
    errorMessage: "Temat jest wymagany (5-200 znaków)",
  },
  activityTitle: {
    required: true,
    minLength: 3,
    maxLength: 100,
    errorMessage: "Tytuł jest wymagany (3-100 znaków)",
  },
  content: {
    required: true,
    minLength: 100,
    errorMessage: "Treść materiału jest wymagana (min. 100 znaków)",
  },
  duration: {
    required: true,
    min: 5,
    max: 180,
    errorMessage: "Czas trwania musi być między 5 a 180 minut",
  },
};

// ===== UI TEXTS =====
export const MATERIAL_UI_TEXTS = {
  steps: {
    1: {
      title: "O czym chcesz stworzyć materiał?",
      description:
        "Podaj temat, poziom zaawansowania i grupę docelową - AI pomoże stworzyć angażujący materiał edukacyjny",
      button: "Analizuj temat",
      loading: "Analizuję temat...",
    },
    2: {
      title: "Analiza tematu",
      description:
        "AI przeanalizowała temat i zaproponowała strukturę materiału",
      success: "✓ Analiza zakończona pomyślnie",
    },
    3: {
      title: "Dostosuj cele i typ materiału",
      description:
        "Możesz zmodyfikować cele nauczania i wybrać typ materiału do wygenerowania",
      button: "Generuj materiał",
      loading: "Generuję materiał...",
      loadingInfo: "⚡ AI tworzy spersonalizowany materiał edukacyjny...",
    },
    4: {
      title: "Podgląd wygenerowanego materiału",
      description: "AI przygotowała kompletny materiał edukacyjny",
      info: "💡 W następnym kroku możesz dodać pytania kontrolne.",
    },
    5: {
      title: "Dodaj pytania kontrolne",
      description:
        "Możesz opcjonalnie dodać pytania kontrolne do wybranych sekcji materiału",
      info: "📝 Pytania kontrolne pomagają uczniom lepiej zrozumieć materiał",
      button: "Przejdź dalej",
    },
    6: {
      title: "Zapisz materiał w kursie",
      description:
        "Wybierz kurs i temat, następnie dostosuj materiał przed zapisaniem",
      saveInfo:
        "💾 Materiał zostanie zapisany jako nowa aktywność w wybranym temacie",
      button: "Zapisz materiał",
      loading: "Zapisuję...",
      success:
        "✓ Materiał został zapisany pomyślnie! Przekierowuję do kursu...",
    },
  },
  dashboard: {
    title: "Kreator materiałów edukacyjnych",
    description: "Twórz angażujące materiały z pomocą AI",
    wizardTitle: "Kreator materiałów AI",
    wizardDescription: "Stwórz materiał edukacyjny w 6 prostych krokach",
    features: [
      "Automatyczna analiza tematu",
      "Dostosowanie do wieku uczniów",
      "Generowanie celów nauczania",
      "Formatowanie Markdown",
      "Integracja z kursami",
    ],
  },
  errors: {
    subjectRequired: "Podaj temat materiału",
    analysisError: "Błąd analizy tematu:",
    generationError: "Błąd generowania materiału:",
    saveError: "Wystąpił błąd podczas zapisu",
    unexpectedError: "Wystąpił nieoczekiwany błąd",
    noCourses: "Nie znaleziono żadnych kursów",
    noTopics: "Wybierz najpierw kurs",
  },
};

// ===== API CONFIG =====
export const MATERIAL_API_CONFIG = {
  llmEndpoint: "https://diesel-power-backend.onrender.com/api/chat",
  saveTimeout: 2000,
};

// ===== NAVIGATION PATHS =====
export const MATERIAL_PATHS = {
  dashboard: "/teacher/educational-material",
  step1: "/teacher/educational-material/step1",
  step2: "/teacher/educational-material/step2",
  step3: "/teacher/educational-material/step3",
  step4: "/teacher/educational-material/step4",
  step5: "/teacher/educational-material/step5",
  step6: "/teacher/educational-material/step6",
  courses: "/teacher/courses",
};