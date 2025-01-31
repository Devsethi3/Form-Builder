"use client";

import { useDesigner } from "@/context/DesignerContext";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

export default function PageNavigation() {
  const { pages, currentPage, setCurrentPage, isMultiPage } = useDesigner();

  if (!isMultiPage) return null;

  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const navigationType = pages[0]?.config.navigationType || 'tabs';
  const showPageNumbers = pages[0]?.config.showPageNumbers || true;

  if (navigationType === 'tabs') {
    return (
      <div className="flex items-center gap-2 justify-center mb-4 bg-muted/50 p-2 rounded-md">
        {pages.map((_, index) => (
          <Button
            key={index}
            variant={currentPage === index ? "default" : "ghost"}
            size="sm"
            onClick={() => handlePageChange(index)}
            className={cn(
              "min-w-[60px]",
              currentPage === index && "pointer-events-none"
            )}
          >
            {showPageNumbers ? `Page ${index + 1}` : `•`}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 items-center justify-center mb-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          <BiChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          {pages.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentPage === index
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30"
              )}
              onClick={() => handlePageChange(index)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pages.length - 1}
        >
          <BiChevronRight className="h-4 w-4" />
        </Button>
      </div>
      {showPageNumbers && (
        <p className="text-sm text-muted-foreground">
          Page {currentPage + 1} of {pages.length}
        </p>
      )}
    </div>
  );
}
