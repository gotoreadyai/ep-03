// src/components/course/CourseSelector.tsx
import { useState } from "react";
import { useList } from "@refinedev/core";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
  Alert,
  AlertDescription,
  Badge,
} from "@/components/ui";
import { Info, EyeOff } from "lucide-react";

type CourseSelectorProps = {
  value: number | null;
  onChange: (courseId: number | null) => void;
  showAlert?: boolean;
  label?: string;
  placeholder?: string;
};

export function CourseSelector({
  value,
  onChange,
  showAlert = true,
  label,
  placeholder = "Wybierz kurs",
}: CourseSelectorProps) {
  const [showOnlyPublished, setShowOnlyPublished] = useState(false);

  const { data: coursesData } = useList({
    resource: "courses",
    filters: showOnlyPublished
      ? [{ field: "is_published", operator: "eq", value: true }]
      : [],
    sorters: [{ field: "created_at", order: "desc" }],
    pagination: { pageSize: 100 },
  });

  const selectedCourse = coursesData?.data?.find((c: any) => c.id === value);

  return (
    <div className="space-y-4">
      {label && <label className="text-xs font-medium block">{label}</label>}

      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
        <Checkbox
          checked={showOnlyPublished}
          onCheckedChange={(checked) => setShowOnlyPublished(!!checked)}
        />
        <label className="text-sm cursor-pointer">
          Pokazuj tylko opublikowane kursy
        </label>
      </div>

      <Select
        value={value ? String(value) : ""}
        onValueChange={(v) => onChange(v ? Number(v) : null)}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {(coursesData?.data || []).length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground">
              {showOnlyPublished
                ? "Brak opublikowanych kursów. Odznacz filtr."
                : "Brak kursów. Najpierw wygeneruj kurs."}
            </div>
          ) : (
            (coursesData?.data || []).map((c: any) => (
              <SelectItem key={c.id} value={String(c.id)}>
                <div className="flex items-center gap-2">
                  {c.icon_emoji ? `${c.icon_emoji} ` : "📚 "}
                  <span>{c.title}</span>
                  {!c.is_published && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Szkic
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {showAlert && selectedCourse && !selectedCourse.is_published && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Wybrany kurs jest szkicem (nieopublikowany). Materiały zostaną
            utworzone, ale nie będą widoczne dla uczniów dopóki nie
            opublikujesz kursu.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}