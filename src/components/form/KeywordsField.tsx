// src/components/form/KeywordsField.tsx
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { FormControl } from "./FormControl";


interface KeywordsFieldProps {
  label?: string;
  placeholder?: string;
  value?: string[];
  onChange: (keywords: string[]) => void;
  error?: string;
  required?: boolean;
  minKeywords?: number;
  maxKeywords?: number;
  className?: string;
}

export const KeywordsField = ({
  label = "Keywords",
  placeholder = "Add a keyword...",
  value = [],
  onChange,
  error,
  required = false,
  minKeywords = 1,
  maxKeywords,
  className = ""
}: KeywordsFieldProps) => {
  const [keywords, setKeywords] = useState<string[]>(value);
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    setKeywords(value);
  }, [value]);

  const addKeyword = () => {
    const trimmedInput = keywordInput.trim();
    
    if (!trimmedInput) return;
    
    if (keywords.includes(trimmedInput)) {
      setKeywordInput("");
      return;
    }
    
    if (maxKeywords && keywords.length >= maxKeywords) {
      return;
    }
    
    const newKeywords = [...keywords, trimmedInput];
    setKeywords(newKeywords);
    onChange(newKeywords);
    setKeywordInput("");
  };

  const removeKeyword = (keywordToRemove: string) => {
    const newKeywords = keywords.filter((k) => k !== keywordToRemove);
    setKeywords(newKeywords);
    onChange(newKeywords);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  const getError = () => {
    if (error) return error;
    if (required && keywords.length < minKeywords) {
      return minKeywords === 1 
        ? "At least one keyword is required" 
        : `At least ${minKeywords} keywords are required`;
    }
    return undefined;
  };

  const isAddDisabled = 
    !keywordInput.trim() || 
    (maxKeywords ? keywords.length >= maxKeywords : false);

  return (
    <FormControl
      label={label}
      error={getError()}
      required={required}
      className={className}
    >
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={maxKeywords ? keywords.length >= maxKeywords : false}
          />
          <Button 
            type="button" 
            onClick={addKeyword} 
            variant="outline"
            disabled={isAddDisabled}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <Badge
                key={`${keyword}-${index}`}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                <span>{keyword}</span>
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${keyword}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {maxKeywords && (
          <p className="text-xs text-muted-foreground">
            {keywords.length} / {maxKeywords} keywords
          </p>
        )}
      </div>
    </FormControl>
  );
};