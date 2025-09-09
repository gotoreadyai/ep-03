import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOne, useList, useCreate } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserPlus, Check, X, Mail } from "lucide-react";
import { Button, Checkbox, Badge, Input } from "@/components/ui";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { toast } from "sonner";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface GroupMember {
  user_id: string;
  group_id: number;
}

export const GroupsAssignStudents = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Pobierz dane grupy
  const { data: groupData, isLoading: groupLoading } = useOne({
    resource: "groups",
    id: id as string,
  });

  // Pobierz wszystkich uczniów
  const { data: studentsData, isLoading: studentsLoading } = useList<User>({
    resource: "users",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "student",
      },
    ],
    pagination: {
      mode: "off",
    },
  });

  // Pobierz aktualnych członków grupy
  const { data: membersData, isLoading: membersLoading } =
    useList<GroupMember>({
      resource: "group_members",
      filters: [
        {
          field: "group_id",
          operator: "eq",
          value: parseInt(id as string),
        },
      ],
      pagination: {
        mode: "off",
      },
      meta: {
        select: "user_id, group_id",
      },
    });

  // Mutacja do dodawania uczniów
  const { mutate: createGroupMember, isLoading: isAssigning } = useCreate();

  const handleSubmit = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Wybierz przynajmniej jednego ucznia");
      return;
    }

    try {
      // Dodaj każdego ucznia do grupy
      const promises = selectedStudents.map((userId) =>
        createGroupMember(
          {
            resource: "group_members",
            values: {
              user_id: userId,
              group_id: parseInt(id as string),
            },
          },
          {
            onSuccess: () => {
              console.log(`Student ${userId} assigned successfully`);
            },
            onError: (error) => {
              console.error("Error assigning student:", userId, error);
            },
          }
        )
      );

      await Promise.all(promises);

      toast.success(`Dodano ${selectedStudents.length} uczniów do grupy`);
      navigate(`/groups/show/${id}`);
    } catch (error) {
      toast.error("Błąd podczas dodawania uczniów");
      console.error("Error details:", error);
    }
  };

  if (groupLoading || studentsLoading || membersLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const group = groupData?.data;
  const memberUserIds = membersData?.data?.map((m) => m.user_id) || [];

  // Filtruj uczniów - pokaż tylko tych którzy nie są jeszcze w grupie
  const availableStudents =
    studentsData?.data?.filter(
      (student) => !memberUserIds.includes(student.id)
    ) || [];

  // Filtruj po wyszukiwaniu
  const filteredStudents = availableStudents.filter(
    (student) =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAll = () => {
    setSelectedStudents(filteredStudents.map((s) => s.id));
  };

  const deselectAll = () => {
    setSelectedStudents([]);
  };

  return (
    <SubPage>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/teacher/groups/show/${id}`)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do grupy
      </Button>

      <FlexBox>
        <Lead
          title="Dodaj uczniów"
          description={`Dodawanie uczniów do grupy: ${group?.name}`}
        />
      </FlexBox>

      <Card>
        <CardHeader>
          <FlexBox>
            <CardTitle>Dostępni uczniowie</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                disabled={filteredStudents.length === 0}
              >
                <Check className="w-4 h-4 mr-2" />
                Zaznacz wszystkich
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deselectAll}
                disabled={selectedStudents.length === 0}
              >
                <X className="w-4 h-4 mr-2" />
                Odznacz wszystkich
              </Button>
            </div>
          </FlexBox>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Szukaj uczniów..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />

          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {availableStudents.length === 0 ? (
                <>
                  <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Wszyscy uczniowie są już w tej grupie</p>
                </>
              ) : (
                <>
                  <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Nie znaleziono uczniów</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleStudent(student.id)}
                >
                  <Checkbox
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={() => toggleStudent(student.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{student.full_name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {student.email}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Uczeń
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {selectedStudents.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                Wybrano {selectedStudents.length} uczniów do dodania
              </p>
              <FlexBox>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/teacher/groups/show/${id}`)}
                >
                  Anuluj
                </Button>
                <Button onClick={handleSubmit} disabled={isAssigning}>
                  {isAssigning ? "Dodawanie..." : "Dodaj uczniów"}
                </Button>
              </FlexBox>
            </div>
          )}
        </CardContent>
      </Card>
    </SubPage>
  );
};