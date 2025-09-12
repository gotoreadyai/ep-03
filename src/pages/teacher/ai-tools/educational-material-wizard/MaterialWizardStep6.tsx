import React, { useState} from "react";
import { useNavigate } from "react-router-dom";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import { useCreate, useList } from "@refinedev/core";
import { Save, ArrowLeft, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  MATERIAL_VALIDATION,
  MATERIAL_UI_TEXTS,
  MATERIAL_PATHS,
} from "./educationalMaterialWizard.constants";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import { SubPage } from "@/components/layout";
import { toast } from "sonner";

export const MaterialWizardStep6: React.FC = () => {
  const navigate = useNavigate();
  const { getData, setData } = useFormSchemaStore();
  const { mutate: createActivity } = useCreate();
  const formData = getData("educational-material-wizard");

  const [activityTitle, setActivityTitle] = useState(formData.title || "");
  const [content, setContent] = useState(formData.content || "");
  const [duration, setDuration] = useState(formData.estimatedDuration || 30);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { steps, errors: errorTexts } = MATERIAL_UI_TEXTS;

  const { data: activitiesData } = useList({
    resource: "activities",
    filters: [
      {
        field: "topic_id",
        operator: "eq",
        value: formData.topicId,
      },
    ],
    sorters: [
      {
        field: "position",
        order: "desc",
      },
    ],
    pagination: {
      pageSize: 1,
    },
    queryOptions: {
      enabled: !!formData.topicId,
    },
  });

  const nextPosition = activitiesData?.data?.[0]?.position 
    ? activitiesData.data[0].position + 1 
    : 1;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!activityTitle.trim() || activityTitle.length < MATERIAL_VALIDATION.activityTitle.minLength) {
      newErrors.activityTitle = MATERIAL_VALIDATION.activityTitle.errorMessage;
    }
    if (!content.trim() || content.length < MATERIAL_VALIDATION.content.minLength) {
      newErrors.content = MATERIAL_VALIDATION.content.errorMessage;
    }
    if (!duration || duration < MATERIAL_VALIDATION.duration.min || duration > MATERIAL_VALIDATION.duration.max) {
      newErrors.duration = MATERIAL_VALIDATION.duration.errorMessage;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setSaved(false);

    try {
      createActivity(
        {
          resource: "activities",
          values: {
            topic_id: formData.topicId,
            type: "material",
            title: activityTitle.trim(),
            content: content.trim(),
            position: nextPosition,
            duration_min: duration,
            is_published: false,
          },
        },
        {
          onSuccess: (data) => {
            setData("educational-material-wizard", {
              ...formData,
              activityTitle: activityTitle.trim(),
              content: content.trim(),
              activityId: data.data.id,
              saved: true,
            });

            setSaving(false);
            setSaved(true);

            const returnUrl = sessionStorage.getItem('returnUrl');
            
            setTimeout(() => {
              sessionStorage.removeItem('wizardContext');
              if (returnUrl) {
                sessionStorage.removeItem('returnUrl');
                navigate(returnUrl);
              } else {
                navigate(`${MATERIAL_PATHS.courses}/show/${formData.courseId}?expanded=${formData.topicId}`);
              }
            }, 1000);
          },
          onError: (error: any) => {
            setSaving(false);
            console.error(errorTexts.saveError, error);
            
            if (error?.code === '42501') {
              toast.error("Brak uprawnień do tworzenia materiałów. Sprawdź swoje uprawnienia.");
            } else if (error?.code === '23505') {
              toast.error("Materiał o takiej nazwie już istnieje.");
            } else {
              toast.error(errorTexts.saveError);
            }
          },
        }
      );
    } catch (error) {
      setSaving(false);
      console.error(errorTexts.unexpectedError, error);
      toast.error(errorTexts.unexpectedError);
    }
  };

  return (
    <SubPage>
      <Card className="border-2 shadow-lg">
        <StepsHero step={6} />

        <CardContent className="p-8">
          <StepsHeader
            title={
              <>
                <FileText className="w-8 h-8 text-purple-600" />
                <span>{steps[6].title}</span>
              </>
            }
            description={steps[6].description}
          />

          {saved && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {steps[6].success}
              </AlertDescription>
            </Alert>
          )}

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            {/* Informacja o miejscu docelowym */}
            <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Miejsce docelowe materiału:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Kurs:</strong> {formData.courseTitle}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Temat:</strong> {formData.topicTitle}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Pozycja:</strong> {nextPosition}</span>
                  </li>
                  {formData.quizzesAdded && (
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Pytania kontrolne:</strong> Dodane</span>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Tytuł aktywności */}
            <div className="space-y-2">
              <Label htmlFor="activityTitle">
                Tytuł aktywności <span className="text-red-500">*</span>
              </Label>
              <Input
                id="activityTitle"
                type="text"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                placeholder="np. Wprowadzenie do zmiennych"
                maxLength={MATERIAL_VALIDATION.activityTitle.maxLength}
                className={errors.activityTitle ? "border-red-500" : ""}
              />
              {errors.activityTitle && (
                <p className="text-sm text-red-600">{errors.activityTitle}</p>
              )}
            </div>

            {/* Czas trwania */}
            <div className="space-y-2">
              <Label htmlFor="duration">
                Czas trwania (min) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                min={MATERIAL_VALIDATION.duration.min}
                max={MATERIAL_VALIDATION.duration.max}
                className={`w-24 ${errors.duration ? "border-red-500" : ""}`}
              />
              {errors.duration && (
                <p className="text-sm text-red-600">{errors.duration}</p>
              )}
              <p className="text-sm text-gray-500">Określ przewidywany czas realizacji materiału</p>
            </div>

            {/* Treść materiału */}
            <div className="space-y-2">
              <Label htmlFor="content">
                Treść materiału <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Treść materiału w formacie Markdown..."
                rows={15}
                className={`font-mono text-sm ${errors.content ? "border-red-500" : ""}`}
              />
              {errors.content && (
                <p className="text-sm text-red-600">{errors.content}</p>
              )}
              <p className="text-sm text-gray-500">
                {content.length} znaków (minimum {MATERIAL_VALIDATION.content.minLength})
              </p>
            </div>

            {/* Informacja o zapisie */}
            <Alert className="bg-purple-50 border-purple-200">
              <AlertDescription className="text-purple-800">
                {steps[6].saveInfo}
              </AlertDescription>
            </Alert>

            <Separator />

            {/* Przyciski nawigacji */}
            <footer className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(MATERIAL_PATHS.step5)}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Wstecz
              </Button>

              <Button
                type="submit"
                disabled={saving || saved}
                className="flex items-center gap-2 min-w-[160px] bg-purple-600 hover:bg-purple-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {steps[6].loading}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {steps[6].button}
                  </>
                )}
              </Button>
            </footer>
          </form>
        </CardContent>
      </Card>
    </SubPage>
  );
};