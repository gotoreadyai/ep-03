import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CourseDescriptionProps {
  description?: string;
  maxLength?: number;
}

export const CourseDescription = ({ 
  description, 
  maxLength = 200 
}: CourseDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!description) return null;
  
  const shouldTruncate = description.length > maxLength;
  const displayText = shouldTruncate && !isExpanded 
    ? description.slice(0, maxLength) + "..." 
    : description;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {displayText}
          </p>
          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 p-0 h-auto font-normal text-primary hover:text-primary/80"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Zwiń opis
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Pokaż cały opis
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};