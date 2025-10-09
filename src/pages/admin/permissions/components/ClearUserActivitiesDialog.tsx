// src/pages/admin/permissions/components/ClearUserActivitiesDialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "@/utility/supabaseClient";

type ClearUserActivitiesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  onSuccess: () => void;
};

export const ClearUserActivitiesDialog = ({
  open,
  onOpenChange,
  user,
  onSuccess,
}: ClearUserActivitiesDialogProps) => {
  const [confirmation, setConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSQL, setShowSQL] = useState(false);
  const [options, setOptions] = useState({
    activityProgress: true,
    gamificationLog: true,
    userStats: true,
    userUpgrades: true,
  });

  const handleClear = async () => {
    if (!user) return;

    // Walidacja potwierdzenia
    if (confirmation !== user.full_name) {
      toast.error("Nieprawidłowe potwierdzenie");
      return;
    }

    setIsLoading(true);

    try {
      // Użyj bezpośrednich DELETE queries
      const promises = [];

      if (options.activityProgress) {
        promises.push(
          supabaseClient.from("activity_progress").delete().eq("user_id", user.id)
        );
      }

      if (options.gamificationLog) {
        promises.push(
          supabaseClient.from("gamification_log").delete().eq("user_id", user.id)
        );
      }

      if (options.userUpgrades) {
        promises.push(
          supabaseClient.from("user_upgrades").delete().eq("user_id", user.id)
        );
      }

      if (options.userStats) {
        promises.push(
          supabaseClient
            .from("user_stats")
            .update({
              total_points: 0,
              current_level: 1,
              daily_streak: 0,
              idle_points_rate: 1,
              quizzes_completed: 0,
              perfect_scores: 0,
              total_time_spent: 0,
            })
            .eq("user_id", user.id)
        );
      }

      const results = await Promise.all(promises);
      const hasError = results.some((r) => r.error);

      if (hasError) {
        const errorDetails = results.filter(r => r.error).map(r => r.error);
        console.error("Errors during clear:", errorDetails);
        throw new Error("Błąd podczas czyszczenia danych");
      }

      toast.success("Aktywności zostały wyczyszczone");
      onSuccess();
      onOpenChange(false);
      setConfirmation("");
    } catch (error) {
      console.error("Clear activities error:", error);
      toast.error("Błąd podczas czyszczenia aktywności");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setConfirmation("");
      }
    }
  };

  if (!user) return null;

  const isConfirmed = confirmation === user.full_name;

  // Generuj SQL do ręcznego wykonania
  const generateSQL = () => {
    const queries = [];
    
    if (options.activityProgress) {
      queries.push(`-- Usuń postępy w aktywnościach
DELETE FROM activity_progress WHERE user_id = '${user.id}';`);
    }
    
    if (options.gamificationLog) {
      queries.push(`-- Usuń historię gamifikacji
DELETE FROM gamification_log WHERE user_id = '${user.id}';`);
    }
    
    if (options.userUpgrades) {
      queries.push(`-- Usuń idle upgrades
DELETE FROM user_upgrades WHERE user_id = '${user.id}';`);
    }
    
    if (options.userStats) {
      queries.push(`-- Zresetuj statystyki
UPDATE user_stats
SET 
  total_points = 0,
  current_level = 1,
  daily_streak = 0,
  idle_points_rate = 1,
  quizzes_completed = 0,
  perfect_scores = 0,
  total_time_spent = 0,
  last_active = CURRENT_DATE,
  last_idle_claim = NOW()
WHERE user_id = '${user.id}';`);
    }
    
    return queries.join('\n\n');
  };

  const copySQL = () => {
    const sql = generateSQL();
    navigator.clipboard.writeText(sql);
    toast.success("SQL skopiowany do schowka");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl"   >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Wyczyść wszystkie aktywności
          </DialogTitle>
          <DialogDescription className="text-left">
            <div className="space-y-2">
              <p>
                Ta akcja usunie dane użytkownika: <strong>{user.full_name}</strong>
              </p>
              <p className="text-destructive font-medium">
                Ta operacja jest nieodwracalna!
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Opcje czyszczenia */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Co chcesz wyczyścić?</Label>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="activityProgress"
                  checked={options.activityProgress}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, activityProgress: checked as boolean })
                  }
                />
                <label
                  htmlFor="activityProgress"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Postępy w aktywnościach (quizy, materiały)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gamificationLog"
                  checked={options.gamificationLog}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, gamificationLog: checked as boolean })
                  }
                />
                <label
                  htmlFor="gamificationLog"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Historia gamifikacji (logi punktów)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="userStats"
                  checked={options.userStats}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, userStats: checked as boolean })
                  }
                />
                <label
                  htmlFor="userStats"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Statystyki (punkty, poziom, streak)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="userUpgrades"
                  checked={options.userUpgrades}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, userUpgrades: checked as boolean })
                  }
                />
                <label
                  htmlFor="userUpgrades"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Idle upgrades
                </label>
              </div>
            </div>
          </div>

          {/* Potwierdzenie */}
          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium">
              Wpisz pełne imię i nazwisko użytkownika aby potwierdzić:
            </Label>
            <Input
              id="confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={user.full_name}
              className="font-mono"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Wymagane: <code className="bg-muted px-1 py-0.5 rounded">{user.full_name}</code>
            </p>
          </div>

          {/* Ostrzeżenie */}
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md border border-destructive/20">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-xs text-foreground leading-relaxed">
              <strong>UWAGA:</strong> Po usunięciu danych nie będzie możliwości ich odzyskania.
              Użytkownik straci wszystkie postępy i będzie musiał zacząć od nowa.
            </div>
          </div>

          {/* Opcja SQL */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSQL(!showSQL)}
              className="w-full"
            >
              {showSQL ? "Ukryj SQL" : "Pokaż SQL (do ręcznego wykonania)"}
            </Button>
            
            {showSQL && (
              <div className="space-y-2">
                <pre className="p-3 bg-muted rounded text-xs overflow-x-auto max-h-[200px] overflow-y-auto">
                  {generateSQL()}
                </pre>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={copySQL}
                  className="w-full"
                >
                  Skopiuj SQL do schowka
                </Button>
                <p className="text-xs text-muted-foreground">
                  Możesz skopiować ten SQL i wykonać go ręcznie w Supabase SQL Editor
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Anuluj
          </Button>
          <Button
            variant="destructive"
            onClick={handleClear}
            disabled={!isConfirmed || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Czyszczenie...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Wyczyść aktywności
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};