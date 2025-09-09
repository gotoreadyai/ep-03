import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useOne } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button, Input, Textarea, Switch } from "@/components/ui";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Form, FormActions, FormControl } from "@/components/form";
import { SubPage } from "@/components/layout";
import { useState } from "react";
import { useParams } from "react-router-dom";

const EMOJI_OPTIONS = ['📚', '🎓', '💡', '🚀', '⭐', '🏆', '🎯', '📖', '✏️', '🧮'];

export const CoursesEdit = () => {
  const { list } = useNavigation();
  const { id } = useParams();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { data, isLoading } = useOne({
    resource: "courses",
    id: id as string,
    liveMode: "off", // Wyłącz realtime
  });

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    refineCoreProps: {
      resource: "courses",
      id: id as string,
      liveMode: "off", // Wyłącz realtime
    }
  });

  const selectedEmoji = watch('icon_emoji');

  if (isLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  return (
    <SubPage>
      <Button
        variant="outline"
        size="sm"
        onClick={() => list("courses")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do listy
      </Button>

      <FlexBox>
        <Lead
          title="Edytuj kurs"
          description={`Edycja kursu: ${data?.data?.title}`}
        />
      </FlexBox>

      <Card>
        <CardHeader>
          <CardTitle>Informacje o kursie</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onFinish)}>
            <GridBox variant="1-2-2">
              <FormControl
                label="Tytuł kursu"
                htmlFor="title"
                error={errors.title?.message as string}
                required
              >
                <Input
                  id="title"
                  placeholder="np. Podstawy programowania"
                  {...register("title", {
                    required: "Tytuł kursu jest wymagany",
                    minLength: {
                      value: 3,
                      message: "Tytuł musi mieć minimum 3 znaki",
                    },
                  })}
                />
              </FormControl>

              <FormControl
                label="Ikona kursu"
                htmlFor="icon_emoji"
              >
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <span className="text-2xl mr-2">{selectedEmoji || '📚'}</span>
                    Wybierz ikonę
                  </Button>
                  
                  {showEmojiPicker && (
                    <div className="absolute top-full mt-2 p-2 bg-white border rounded-lg shadow-lg z-10">
                      <div className="grid grid-cols-5 gap-2">
                        {EMOJI_OPTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className="p-2 hover:bg-gray-100 rounded text-2xl"
                            onClick={() => {
                              setValue('icon_emoji', emoji);
                              setShowEmojiPicker(false);
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
            </GridBox>

            <FormControl
              label="Opis kursu"
              htmlFor="description"
              error={errors.description?.message as string}
            >
              <Textarea
                id="description"
                placeholder="Opisz czego uczniowie nauczą się na tym kursie..."
                rows={4}
                {...register("description")}
              />
            </FormControl>

            <FormControl label="Status publikacji">
              <FlexBox variant="start">
                <Switch
                  checked={watch("is_published") || false}
                  onCheckedChange={(checked) => setValue("is_published", checked)}
                />
                <span className="text-sm text-muted-foreground">
                  Kurs jest opublikowany i widoczny dla uczniów
                </span>
              </FlexBox>
            </FormControl>

            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={() => list("courses")}
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
            </FormActions>
          </Form>
        </CardContent>
      </Card>
    </SubPage>
  );
};