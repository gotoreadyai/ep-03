import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
  import { useNavigate, useParams } from "react-router-dom";
  
  interface Student {
    id: string;
    full_name: string;
    email: string;
  }
  
  interface StudentProgressTableProps {
    students: Student[];
    getStudentProgress: (userId: string) => {
      completedCount: number;
      totalCount: number;
      progressPercentage: number;
      lastActivity: string | null;
      averageScore: number | null;
      totalTimeSpent: number;
    };
  }
  
  export const StudentProgressTable = ({
    students,
    getStudentProgress,
  }: StudentProgressTableProps) => {
    const navigate = useNavigate();
    const { groupId, courseId } = useParams();
  
    const getStatusBadge = (percentage: number) => {
      if (percentage === 100) {
        return (
          <Badge className="bg-green-600 hover:bg-green-700">Ukończony</Badge>
        );
      }
      if (percentage > 0) {
        return <Badge className="bg-blue-600 hover:bg-blue-700">W trakcie</Badge>;
      }
      return <Badge variant="secondary">Brak</Badge>;
    };
  
    const getScoreTrend = (score: number | null) => {
      if (score === null) return <Minus className="w-4 h-4 text-muted-foreground" />;
      if (score >= 80) return <TrendingUp className="w-4 h-4 text-green-600" />;
      if (score >= 60) return <Minus className="w-4 h-4 text-yellow-600" />;
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    };
  
    const formatDate = (date: string | null) => {
      if (!date) return "—";
      return new Date(date).toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
      });
    };
  
    const handleViewDetails = (studentId: string) => {
      navigate(`/teacher/groups/${groupId}/courses/${courseId}/students/${studentId}`);
    };
  
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Uczeń</TableHead>
              <TableHead className="text-center w-[100px]">Status</TableHead>
              <TableHead className="text-center w-[100px]">Postęp</TableHead>
              <TableHead className="text-center w-[120px]">Ukończone</TableHead>
              <TableHead className="text-center w-[100px]">Średnia</TableHead>
              <TableHead className="text-center w-[100px]">Ostatnia</TableHead>
              <TableHead className="text-right w-[120px]">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Brak uczniów w grupie
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => {
                const progress = getStudentProgress(student.id);
                return (
                  <TableRow key={student.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {student.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(progress.progressPercentage)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${progress.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-10 text-right">
                          {progress.progressPercentage.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm">
                        {progress.completedCount}/{progress.totalCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {getScoreTrend(progress.averageScore)}
                        <span className="text-sm font-medium">
                          {progress.averageScore !== null
                            ? `${progress.averageScore.toFixed(0)}%`
                            : "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {formatDate(progress.lastActivity)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(student.id)}
                      >
                        Szczegóły
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    );
  };