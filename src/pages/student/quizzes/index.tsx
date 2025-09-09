// src/pages/student/quizzes/index.tsx
import { Route } from "react-router-dom";
import { QuizTake } from "./take";
import { QuizResult } from "./result";

export { QuizTake } from "./take";

export const quizzesRoutes = [
  <Route key="quiz-take" path="/courses/:courseId/quiz/:quizId" element={<QuizTake />} />,
  <Route key="quiz-result" path="/courses/:courseId/quiz/:quizId/result" element={<QuizResult />} />,
];