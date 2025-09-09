// src/pages/teacher/course-structure-wizard/CourseWizardDashboard.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lead } from "@/components/reader";
import { Button } from "@/components/ui/button";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import { FlexBox, GridBox } from "@/components/shared";
import { useGetIdentity, useList } from "@refinedev/core";
import {
  Layout,
  Check,
  Eye,
  Edit3,
  RefreshCw,
  BookOpen,
  GraduationCap,
  Calendar,
  Rocket,
  Clock,
  Target,
  Users,
  ArrowRight,
  Plus,
} from "lucide-react";
import {
  COURSE_UI_TEXTS,
  COURSE_PATHS,
} from "./courseStructureWizard.constants";
import { SubPage } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const CourseWizardDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const { data: identity } = useGetIdentity<any>();
  const [showCourses, setShowCourses] = useState(false);

  const courseData = getData("course-structure-wizard");
  const { dashboard } = COURSE_UI_TEXTS;

  const { data: coursesData } = useList({
    resource: "courses",
    pagination: { mode: "off" },
    filters: identity?.vendor_id
      ? [{ field: "vendor_id", operator: "eq", value: identity.vendor_id }]
      : [],
    meta: {
      select: "*, topics(count)",
    },
  });

  const courses = coursesData?.data || [];
  const hasSavedCourse = courseData && courseData.courseTitle;

  return (
    <SubPage>
      <Lead title={dashboard.title} description={dashboard.description} />

      <div className="space-y-6">
        {/* Główne akcje */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Nowy kurs */}
          <Card
            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-400 flex flex-col"
            onClick={() => navigate(COURSE_PATHS.step1)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Rocket className="w-8 h-8 text-purple-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <CardTitle>Stwórz nowy kurs</CardTitle>
              <CardDescription>
                Wygeneruj kompletną strukturę kursu od podstaw
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex flex-wrap gap-4 text-sm flex-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>15-20 minut</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span>Pełna struktura</span>
                </div>
              </div>
              <div className="mt-auto pt-4">
                <div className="inline-flex items-center text-sm font-medium text-purple-600">
                  Rozpocznij tworzenie
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edytuj istniejący */}
          <Card
            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-400 flex flex-col"
            onClick={() => setShowCourses(!showCourses)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Edit3 className="w-8 h-8 text-blue-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <CardTitle>Rozwiń istniejący kurs</CardTitle>
              <CardDescription>
                Dodaj nowe tematy do istniejącego kursu z pomocą AI
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex flex-wrap gap-4 text-sm flex-1">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Dodaj tematy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Rozszerz program</span>
                </div>
              </div>
              <div className="mt-auto pt-4">
                <div className="inline-flex items-center text-sm font-medium text-blue-600">
                  Wybierz kurs
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista kursów do edycji */}
        {showCourses && courses.length > 0 && (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle>Wybierz kurs do rozszerzenia</CardTitle>
              <CardDescription>
                Kliknij na kurs, aby dodać nowe tematy z pomocą AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {courses.map((course: any) => (
                  <div
                    key={course.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    onClick={() =>
                      navigate(`/teacher/course-structure/edit/${course.id}`)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{course.icon_emoji}</span>
                      <div>
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-gray-600">
                          {course.topics?.[0]?.count || 0} tematów
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ostatni kurs - oryginalna sekcja */}
        {hasSavedCourse && (
          <Card className="hover:shadow-lg transition-shadow border-2 border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Ostatnia struktura</CardTitle>
                  <CardDescription>
                    Kontynuuj pracę nad swoim kursem
                  </CardDescription>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Wygenerowana
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Tytuł kursu</p>
                  <p className="font-medium text-gray-900">
                    {courseData.courseTitle}
                  </p>
                </div>

                {courseData.subject && (
                  <div>
                    <p className="text-sm text-gray-600">Przedmiot</p>
                    <p className="text-gray-900">{courseData.subject}</p>
                  </div>
                )}

                {courseData.summary && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {courseData.summary.totalWeeks}
                      </div>
                      <div className="text-sm text-gray-600">tygodni</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {courseData.summary.totalTopics}
                      </div>
                      <div className="text-sm text-gray-600">tematów</div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => navigate(COURSE_PATHS.step4)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Podgląd
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(COURSE_PATHS.step3)}
                    className="flex-1"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edytuj
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(COURSE_PATHS.step1)}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Nowa
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Przydatne linki */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 group"
            onClick={() => navigate("/teacher/courses")}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <CardTitle className="text-lg">Kursy</CardTitle>
              <CardDescription>Zobacz wszystkie kursy</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                Kliknij aby przejść →
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-200 group"
            onClick={() => navigate("/teacher/educational-material")}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <CardTitle className="text-lg">Materiały</CardTitle>
              <CardDescription>Kreator materiałów</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 group-hover:text-purple-600 transition-colors">
                Kliknij aby przejść →
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 group"
            onClick={() => navigate("/teacher/quiz-wizard")}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <CardTitle className="text-lg">Quizy</CardTitle>
              <CardDescription>Kreator quizów</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 group-hover:text-green-600 transition-colors">
                Kliknij aby przejść →
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SubPage>
  );
};