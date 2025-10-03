// src/pages/teacher/activities/components/MaterialSectionEditor.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button, Badge, Textarea, Input } from "@/components/ui";
import { ChevronDown, ChevronUp, Eye, Code } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Section {
  id: string;
  title: string;
  content: string;
  hasQuiz: boolean;
}

interface MaterialSectionEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

const parseSections = (markdown: string): Section[] => {
  if (!markdown || !markdown.trim()) {
    return [
      { id: "section-0", title: "Cele lekcji", content: "", hasQuiz: false },
      { id: "section-1", title: "Kluczowe pojęcia", content: "", hasQuiz: false },
      { id: "section-2", title: "Szczegółowe omówienie", content: "", hasQuiz: false },
      { id: "section-3", title: "Przykłady z życia", content: "", hasQuiz: false },
      { id: "section-4", title: "Częste błędy i pułapki", content: "", hasQuiz: false },
      { id: "section-5", title: "Podsumowanie", content: "", hasQuiz: false },
    ];
  }

  const parts = markdown.split(/\n(?=##\s+)/g);
  
  return parts.map((part, index) => {
    const titleMatch = part.match(/^##\s+(.+?)$/m);
    const title = titleMatch ? titleMatch[1].trim() : `Sekcja ${index + 1}`;
    const content = part.replace(/^##\s+.+?\n/, "").trim();
    const hasQuiz = /```quiz[\s\S]*?```/g.test(content);
    const id = `section-${index}`;
    
    return { id, title, content, hasQuiz };
  });
};

const rebuildMarkdown = (sections: Section[]): string => {
  return sections
    .filter(s => s.title.trim() && (s.content.trim() || s.hasQuiz))
    .map(s => `## ${s.title}\n\n${s.content}`)
    .join('\n\n');
};

export const MaterialSectionEditor = ({
  value,
  onChange,
  label,
  error,
  required,
  hint,
}: MaterialSectionEditorProps) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [previewMode, setPreviewMode] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const parsed = parseSections(value);
    setSections(parsed);
    
    const expanded: Record<string, boolean> = {};
    parsed.forEach(s => { expanded[s.id] = true; });
    setExpandedSections(expanded);
  }, [value]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePreview = (id: string) => {
    setPreviewMode(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateSection = (index: number, newContent: string) => {
    const updated = [...sections];
    updated[index] = { 
      ...updated[index], 
      content: newContent, 
      hasQuiz: /```quiz[\s\S]*?```/g.test(newContent) 
    };
    setSections(updated);
    onChange(rebuildMarkdown(updated));
  };

  const updateSectionTitle = (index: number, newTitle: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], title: newTitle };
    setSections(updated);
    onChange(rebuildMarkdown(updated));
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      
      <div className="space-y-3">
        {sections.map((section, index) => (
          <Card key={section.id} className="overflow-hidden">
            <CardHeader className="pb-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection(section.id)}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    {expandedSections[section.id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <div className="flex-1 min-w-0">
                    <Input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSectionTitle(index, e.target.value)}
                      className="h-8 font-semibold border-none shadow-none focus-visible:ring-1"
                      placeholder="Tytuł sekcji"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {section.hasQuiz && (
                    <Badge variant="secondary" className="text-xs">
                      Quiz
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {index + 1}/6
                  </Badge>
                  {expandedSections[section.id] && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePreview(section.id)}
                      className="h-8"
                      title={previewMode[section.id] ? "Tryb edycji" : "Podgląd"}
                    >
                      {previewMode[section.id] ? (
                        <Code className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            {expandedSections[section.id] && (
              <CardContent className="pt-4">
                {previewMode[section.id] ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert border rounded-lg p-4 bg-muted/20 min-h-[150px]">
                    {section.content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {section.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-muted-foreground italic">Brak treści w tej sekcji</p>
                    )}
                  </div>
                ) : (
                  <Textarea
                    value={section.content}
                    onChange={(e) => updateSection(index, e.target.value)}
                    className="font-mono text-sm min-h-[200px]"
                    placeholder="Treść sekcji w Markdown...\n\n**Pogrubienie** *kursywa*\n\n- Lista\n- Punktowana\n\n| Tabela | Kolumna |\n|--------|--------|\n| Dane   | Wartość |"
                  />
                )}
                
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{section.content.length} znaków</span>
                  {section.hasQuiz && <span className="text-blue-600 font-medium">Zawiera quiz</span>}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
      
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};