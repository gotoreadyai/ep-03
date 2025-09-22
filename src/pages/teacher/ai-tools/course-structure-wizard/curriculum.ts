// src/pages/teacher/ai-tools/course-structure-wizard/curriculum.ts

export type OutcomesBySubject = Record<string, string[]>;
export type CurriculumEntry = {
  id: string;
  label: string;      // np. "Podstawa programowa LO (2025) — Chemia (podstawowy)"
  year?: number;      // informacyjnie
  level?: "podstawowy" | "rozszerzony"; // poziom w ramach danego przedmiotu (jeśli dotyczy)
  sourceUrl?: string; // link do dokumentu
  subjects: string[]; // które przedmioty obejmuje
  outcomes: OutcomesBySubject; // wymagania per przedmiot
};

export const SUBJECTS = [
  "Matematyka",
  "Biologia",
  "Chemia",
  "Fizyka",
  "Informatyka",
  "Geografia",
  "Historia",
  "Polski",
  "Angielski",
] as const;

type SubjectName = typeof SUBJECTS[number];

// aliasy nazw UI -> oficjalne etykiety sekcji (gdy się różnią)
const SUBJECT_ALIASES: Record<SubjectName, string> = {
  Matematyka: "Matematyka",
  Biologia: "Biologia",
  Chemia: "Chemia",
  Fizyka: "Fizyka",
  Informatyka: "Informatyka",
  Geografia: "Geografia",
  Historia: "Historia",
  Polski: "Język polski",
  Angielski: "Język obcy nowożytny",
} as const;

// Lokalny rejestr – wersja 2025 (streszczenia własne; linki do stron z podstawą)
export const CURRICULA: CurriculumEntry[] = [
  {
    id: "pl-lo-2025-math",
    label: "Podstawa programowa LO (2025) — Matematyka",
    year: 2025,
    sourceUrl: "https://www.podstawaprogramowa.pl/liceum-technikum/matematyka",
    subjects: ["Matematyka"],
    outcomes: {
      Matematyka: [
        "Rozwiązuje równania i nierówności oraz interpretuje wyniki.",
        "Analizuje funkcje i wykresy; stosuje własności do rozwiązywania zadań.",
        "Geometria płaska i przestrzenna w praktycznych zastosowaniach.",
        "Rachunek prawdopodobieństwa i statystyka opisowa do wnioskowania.",
        "Modeluje problemy tekstowe z użyciem narzędzi matematycznych.",
      ],
    },
  },
  {
    id: "pl-lo-2025-it",
    label: "Podstawa programowa LO (2025) — Informatyka",
    year: 2025,
    sourceUrl: "https://www.podstawaprogramowa.pl/liceum-technikum/informatyka",
    subjects: ["Informatyka"],
    outcomes: {
      Informatyka: [
        "Projektuje i analizuje proste algorytmy; implementuje je.",
        "Dobiera i stosuje struktury danych.",
        "Pisze, uruchamia i testuje programy.",
        "Podstawy sieci i bezpieczeństwa informacji.",
        "Współpraca zespołowa (repozytoria, wersjonowanie).",
      ],
    },
  },
  {
    id: "pl-lo-2025-polish",
    label: "Podstawa programowa LO (2025) — Język polski",
    year: 2025,
    sourceUrl: "https://www.podstawaprogramowa.pl/liceum-technikum/jezyk-polski",
    subjects: ["Polski"],
    outcomes: {
      Polski: [
        "Analizuje i interpretuje teksty literackie i nieliterackie.",
        "Świadomie posługuje się środkami językowymi w wypowiedzi.",
        "Tworzy wypowiedzi pisemne zgodne z wymogami gatunku.",
        "Rozpoznaje konteksty kulturowe i historyczne utworów.",
        "Korzysta z różnych źródeł informacji i je weryfikuje.",
      ],
    },
  },
  {
    id: "pl-lo-2025-bio",
    label: "Podstawa programowa LO (2025) — Biologia",
    year: 2025,
    sourceUrl: "https://www.podstawaprogramowa.pl/liceum-technikum/biologia",
    subjects: ["Biologia"],
    outcomes: {
      Biologia: [
        "Wyjaśnia zjawiska biologiczne w oparciu o strukturę i funkcję.",
        "Planuje i interpretuje proste doświadczenia biologiczne.",
        "Analizuje dziedziczenie cech i zmienność organizmów.",
        "Rozumie podstawy ekologii i ochrony środowiska.",
        "Korzysta z danych biologicznych do wnioskowania.",
      ],
    },
  },
  {
    id: "pl-lo-2025-phy",
    label: "Podstawa programowa LO (2025) — Fizyka",
    year: 2025,
    sourceUrl: "https://www.podstawaprogramowa.pl/liceum-technikum/fizyka",
    subjects: ["Fizyka"],
    outcomes: {
      Fizyka: [
        "Opisuje i wyjaśnia zjawiska fizyczne z użyciem pojęć i praw fizyki.",
        "Wykonuje pomiary, szacuje niepewności i analizuje wyniki.",
        "Stosuje zasady dynamiki, energii i pędu w zadaniach.",
        "Interpretuje wykresy i zależności wielkości fizycznych.",
        "Rozwiązuje zadania obliczeniowe, uzasadniając tok rozumowania.",
      ],
    },
  },

  // 🔽🔽 CHEMIA — DWA ODDZIELNE WPISY 🔽🔽
  {
    id: "pl-lo-2025-chem-podst",
    label: "Podstawa programowa LO (2025) — Chemia (podstawowy)",
    year: 2025,
    level: "podstawowy",
    sourceUrl: "https://podstawaprogramowa.pl/Liceum-technikum/Chemia",
    subjects: ["Chemia"],
    outcomes: {
      Chemia: [
        "Stosuje zasady BHP w pracowni chemicznej; rozpoznaje piktogramy i prowadzi proste doświadczenia.",
        "Opisuje budowę atomu i okresowość właściwości pierwiastków; zapisuje proste konfiguracje elektronowe.",
        "Rozróżnia i charakteryzuje wiązania (jonowe, kowalencyjne, metaliczne) i przewiduje właściwości substancji.",
        "Posługuje się pojęciami mol, masa molowa, objętość molowa; wykonuje obliczenia stechiometryczne.",
        "Pisze i bilansuje równania reakcji, w tym redoks; wyznacza stopnie utlenienia.",
        "Analizuje roztwory: oblicza stężenie procentowe i molowe; opisuje rozpuszczalność i czynniki ją zmieniające.",
        "Opisuje kwasowo-zasadowość: pH, wskaźniki, moc kwasów/zasad; rozwiązuje proste zadania obliczeniowe.",
        "Wyjaśnia czynniki wpływające na szybkość reakcji; opisuje równowagi chemiczne i zasadę Le Chateliera.",
        "Charakteryzuje właściwości gazów i cieczy; stosuje równanie gazu doskonałego w prostych zadaniach.",
        "Rozpoznaje podstawowe grupy funkcyjne w chemii organicznej; podaje właściwości i reakcje charakterystyczne.",
        "Interpretuje i krytycznie analizuje dane (tabele, wykresy, schematy) oraz formułuje wnioski.",
        "Wskazuje zastosowania związków chemicznych w życiu codziennym, środowisku i przemyśle; ocenia wpływ na środowisko.",
      ],
    },
  },
  {
    id: "pl-lo-2025-chem-rozsz",
    label: "Podstawa programowa LO (2025) — Chemia (rozszerzony)",
    year: 2025,
    level: "rozszerzony",
    sourceUrl: "https://podstawaprogramowa.pl/Liceum-technikum/Chemia",
    subjects: ["Chemia"],
    outcomes: {
      Chemia: [
        "Wykonuje złożone obliczenia stechiometryczne (odczynnik ograniczający, wydajność, mieszanie roztworów).",
        "Stosuje prawa termochemii: ΔH reakcji, prawo Hessa; jakościowo interpretuje wpływ ΔS i ΔG na spontaniczność.",
        "Analizuje równowagi: zapisuje wyrażenia Kc/Kp, szacuje przesunięcia równowagi (Le Chatelier), rozwiązuje proste układy z K.",
        "Opisuje i oblicza zagadnienia kwas-zasada: stałe dysocjacji, hydroliza soli, bufor i równanie Hendersona–Hasselbalcha.",
        "Projektuje i interpretuje miareczkowania (kwas–zasada, redoks); szkicuje krzywe miareczkowania i dobiera wskaźniki.",
        "Stosuje podstawy kinetyki: prawo szybkości, rząd reakcji z danych doświadczalnych, pojęcie energii aktywacji (Arrhenius jakościowo).",
        "Wykorzystuje elektrochemię: buduje schematy ogniw, oblicza SEM ze standardowych potencjałów; jakościowo stosuje równanie Nernsta.",
        "Posługuje się iloczynem rozpuszczalności (Ksp) do przewidywania strącania; analizuje równowagi strąceniowe.",
        "Rozpoznaje i opisuje mechanizmy podstawowych reakcji organicznych (substytucja/addycja/eliminacja na poziomie jakościowym).",
        "Analizuje izomerię (strukturalna, geometryczna, optyczna) i konsekwencje stereochemiczne właściwości związków.",
        "Charakteryzuje polimery (addycja, kondensacja), makrocząsteczki i ich zastosowania; wskazuje aspekty środowiskowe.",
        "Stosuje elementy analizy jakościowej i instrumentalnej (chromatografia w ujęciu szkolnym, proste widma) do identyfikacji związków.",
      ],
    },
  },
  // 🔼🔼 CHEMIA — KONIEC 🔼🔼

  {
    id: "pl-lo-2025-geo",
    label: "Podstawa programowa LO (2025) — Geografia",
    year: 2025,
    sourceUrl: "https://www.podstawaprogramowa.pl/liceum-technikum/geografia",
    subjects: ["Geografia"],
    outcomes: {
      Geografia: [
        "Analizuje mapy, dane statystyczne i obrazy Ziemi.",
        "Wyjaśnia procesy przyrodnicze i społeczno-ekonomiczne.",
        "Ocena wpływu działalności człowieka na środowisko.",
        "Interpretuje wskaźniki demograficzne i gospodarcze.",
        "Korzysta z narzędzi GIS/geo-danych na poziomie podstawowym.",
      ],
    },
  },
  {
    id: "pl-lo-2025-hist",
    label: "Podstawa programowa LO (2025) — Historia",
    year: 2025,
    sourceUrl: "https://www.podstawaprogramowa.pl/liceum-technikum/historia",
    subjects: ["Historia"],
    outcomes: {
      Historia: [
        "Porządkuje wydarzenia w czasie i przestrzeni (chronologia, mapa).",
        "Analizuje i interpretuje źródła historyczne.",
        "Wyjaśnia przyczyny i skutki zjawisk historycznych.",
        "Rozpoznaje spory interpretacyjne i różne narracje.",
        "Formułuje argumenty i wnioski w dyskusji o przeszłości.",
      ],
    },
  },
  {
    id: "pl-lo-2025-eng",
    label: "Podstawa programowa LO (2025) — Język obcy nowożytny (Angielski)",
    year: 2025,
    sourceUrl: "https://www.podstawaprogramowa.pl/liceum-technikum/jezyk-obcy-nowozytny",
    subjects: ["Angielski"],
    outcomes: {
      Angielski: [
        "Rozumie typowe wypowiedzi ustne i pisemne w kontekście szkolnym.",
        "Komunikuje się w codziennych sytuacjach i w tematach szkolnych.",
        "Pisze krótkie wypowiedzi użytkowe zgodnie z celem i odbiorcą.",
        "Rozwija zakres środków językowych (słownictwo, gramatyka).",
        "Stosuje strategie uczenia się i korzysta z różnych źródeł.",
      ],
    },
  },
];

// ---- Helpers ----

function resolveSubjectName(subject: string): SubjectName | null {
  const match = (SUBJECTS as readonly string[]).find((s) => s === subject);
  return (match as SubjectName | undefined) ?? null;
}

/**
 * Zwraca najnowszą (najwyższy year) pozycję dla danego przedmiotu.
 * Jeśli kilka ma ten sam rok, bierze najniższe id leksykograficznie (deterministycznie).
 * (Nie rozróżnia poziomu – do pobrania konkretnego poziomu użyj listCurriculaForSubject i filtruj po `level`).
 */
export function getLatestCurriculumForSubject(subject?: string): CurriculumEntry | null {
  if (!subject) return null;
  const uiName = resolveSubjectName(subject);
  if (!uiName) return null;

  const normalized = SUBJECT_ALIASES[uiName];

  const list = CURRICULA.filter((c) => c.subjects.includes(uiName) || c.subjects.includes(normalized));
  if (list.length === 0) return null;

  const sorted = [...list].sort((a, b) => {
    const ya = a.year ?? 0;
    const yb = b.year ?? 0;
    if (yb !== ya) return yb - ya;
    return a.id.localeCompare(b.id);
  });

  return sorted[0] ?? null;
}

export function listCurriculaForSubject(subject?: string): CurriculumEntry[] {
  if (!subject) return [];
  const uiName = resolveSubjectName(subject);
  if (!uiName) return [];
  const normalized = SUBJECT_ALIASES[uiName];
  return CURRICULA.filter((c) => c.subjects.includes(uiName) || c.subjects.includes(normalized));
}

export function getOutcomesForSubject(subject?: string): string[] {
  if (!subject) return [];
  const latest = getLatestCurriculumForSubject(subject);
  if (!latest) return [];
  return latest.outcomes[subject] ?? [];
}

export function getCurriculumById(id: string): CurriculumEntry | null {
  return CURRICULA.find((c) => c.id === id) ?? null;
}
