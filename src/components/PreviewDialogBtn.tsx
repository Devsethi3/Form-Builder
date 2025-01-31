"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { MdPreview } from "react-icons/md";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { FormElements } from "./FormElements";
import useDesigner from "@/hooks/useDesigner";
import { formThemes } from "@/schemas/form";
import { cn } from "@/lib/utils";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

function PreviewDialogBtn() {
  const { elements, theme, isMultiPage, pages } = useDesigner();
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0);

  const navigationType = pages[0]?.config.navigationType || 'tabs';
  const showPageNumbers = pages[0]?.config.showPageNumbers || true;

  const handleNextPage = () => {
    if (isMultiPage && currentPreviewPage < pages.length - 1) {
      setCurrentPreviewPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (isMultiPage && currentPreviewPage > 0) {
      setCurrentPreviewPage(prev => prev - 1);
    }
  };

  const handlePageClick = (pageIndex: number) => {
    if (isMultiPage && pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPreviewPage(pageIndex);
    }
  };

  const renderPageNavigation = () => {
    if (!isMultiPage) return null;

    if (navigationType === 'tabs') {
      return (
        <div className="flex items-center gap-2 justify-center mb-4">
          {pages.map((_, index) => (
            <Button
              key={index}
              variant={currentPreviewPage === index ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageClick(index)}
              className={cn(
                "min-w-[60px]",
                currentPreviewPage === index && "pointer-events-none"
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
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPreviewPage === 0}
          >
            <BiChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {pages.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all cursor-pointer",
                  currentPreviewPage === index
                    ? "bg-primary w-4"
                    : "bg-muted-foreground/30"
                )}
                onClick={() => handlePageClick(index)}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPreviewPage === pages.length - 1}
          >
            <BiChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {showPageNumbers && (
          <p className="text-sm text-muted-foreground">
            Page {currentPreviewPage + 1} of {pages.length}
          </p>
        )}
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="gap-2">
          <MdPreview className="h-6 w-6" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="w-screen h-screen max-h-screen max-w-full flex flex-col flex-grow gap-0 p-0">
        <div className="px-4 py-2 border-b">
          <p className="text-lg font-bold text-muted-foreground">Form preview</p>
          <p className="text-sm text-muted-foreground">This is how your form will look like to your users.</p>
        </div>
        <div className="bg-accent flex flex-col flex-grow items-center justify-center p-4 bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)]">
          <div className={cn(
            formThemes[theme].styles.background,
            formThemes[theme].styles.text,
            formThemes[theme].styles.border,
            "w-full max-w-[620px] flex flex-col flex-grow rounded-2xl p-8 overflow-y-auto border"
          )}>
            {renderPageNavigation()}
            {isMultiPage ? (
              pages[currentPreviewPage]?.elements.map((element) => {
                const FormComponent = FormElements[element.type].formComponent;
                return <FormComponent key={element.id} elementInstance={element} />;
              })
            ) : (
              elements.map((element) => {
                const FormComponent = FormElements[element.type].formComponent;
                return <FormComponent key={element.id} elementInstance={element} />;
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PreviewDialogBtn;
