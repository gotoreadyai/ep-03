import { Button } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface BackToCourseButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  children?: React.ReactNode;
}

export const BackToCourseButton = ({ 
  variant = "outline", 
  size = "sm",
  children = "Powrót do kursu"
}: BackToCourseButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleBack = () => {
    // 1) Priorytet: sessionStorage (większość miejsc zapisuje tu returnUrl)
    const stored = sessionStorage.getItem("returnUrl");
    if (stored) {
      sessionStorage.removeItem("returnUrl");
      navigate(stored);
      return;
    }

    // 2) Fallback: query param ?returnUrl=
    const params = new URLSearchParams(location.search);
    const qp = params.get("returnUrl");
    if (qp) {
      navigate(decodeURIComponent(qp));
      return;
    }

    // 3) Ostatecznie – zwykłe cofnięcie w historii
    navigate(-1);
  };

  return (
    <Button variant={variant} size={size} onClick={handleBack}>
      <ArrowLeft className="w-4 h-4 mr-2" />
      {children}
    </Button>
  );
};
