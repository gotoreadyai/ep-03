// src/components/navigation/PaginationSwith.tsx
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FlexBox } from "@/components/shared";

interface PaginationSwithProps {
  current: number;
  pageSize: number;
  total: number;
  setCurrent: (page: number) => void;
  setPageSize?: (size: number) => void;
  itemName?: string;
  pageSizeOptions?: number[];
}

export const PaginationSwith = ({
  current,
  pageSize,
  total,
  setCurrent,
  setPageSize,
  itemName = "elementów",
  pageSizeOptions = [10, 20, 50],
}: PaginationSwithProps) => {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (current - 1) * pageSize + 1;
  const endItem = Math.min(current * pageSize, total);

  const canGoPrev = current > 1;
  const canGoNext = current < totalPages;

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push("...");
      }

      // Show pages around current
      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (total === 0) return null;

  return (
    <FlexBox className="mt-6">
      {/* Items info */}
      <div className="text-sm text-muted-foreground">
        Pokazuje {startItem}-{endItem} z {total} {itemName}
      </div>

      {/* Pagination controls */}
      <FlexBox className="gap-2">
        {/* Page size selector */}
        {setPageSize && (
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(parseInt(value));
              setCurrent(1); // Reset to first page when changing page size
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size} / str.
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrent(current - 1)}
          disabled={!canGoPrev}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page numbers */}
        <div className="hidden sm:flex gap-1">
          {generatePageNumbers().map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-1 text-sm text-muted-foreground"
                >
                  ...
                </span>
              );
            }

            return (
              <Button
                key={page}
                variant={current === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrent(page as number)}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Mobile page indicator */}
        <div className="flex sm:hidden items-center px-3 text-sm">
          {current} / {totalPages}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrent(current + 1)}
          disabled={!canGoNext}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </FlexBox>
    </FlexBox>
  );
};

// Alternative simplified version
export const SimplePagination = ({
  current,
  total,
  setCurrent,
}: {
  current: number;
  total: number;
  setCurrent: (page: number) => void;
}) => {
  const canGoPrev = current > 1;
  const canGoNext = current < total;

  return (
    <FlexBox className="gap-2 mt-6">
      <Button
        variant="outline"
        onClick={() => setCurrent(current - 1)}
        disabled={!canGoPrev}
      >
        Poprzednia
      </Button>
      <span className="px-4 py-2 text-sm">
        Strona {current} z {total}
      </span>
      <Button
        variant="outline"
        onClick={() => setCurrent(current + 1)}
        disabled={!canGoNext}
      >
        Następna
      </Button>
    </FlexBox>
  );
};