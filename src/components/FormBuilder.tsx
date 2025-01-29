"use client";

import { Form } from "@prisma/client";
import React, { useEffect, useState } from "react";
import PreviewDialogBtn from "./PreviewDialogBtn";
import PublishFormBtn from "./PublishFormBtn";
import GenerateCodeBtn from "./GenerateCodeBtn";
import SaveFormBtn from "./SaveFormBtn";
import Designer from "./Designer";
import { ThemeSelector } from "./ThemeSelector"; 
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import DragOverlayWrapper from "./DragOverlayWrapper";
import { ImSpinner2 } from "react-icons/im";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import Link from "next/link";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import Confetti from "react-confetti";
import useDesigner from "@/hooks/useDesigner";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { formThemes } from "@/schemas/form";
import { ElementsType, FormElement, FormElementInstance, FormElements } from "./FormElements";

function FormBuilder({ form }: { form: Form }) {
  const { setElements, setSelectedElement, setTheme } = useDesigner();
  const [isReady, setIsReady] = useState(false);

  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsSmallScreen(window.innerWidth <= 768);
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768); // Adjust the max width as per your requirement
    };

    // Initial check on mount
    // handleResize();

    // Event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10, // 10px
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 300,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    if (isReady) return;
    const elements = JSON.parse(form.content) as FormElementInstance[];
    
    // Reconstruct form elements properly
    const reconstructedElements = elements.map((element: FormElementInstance) => {
      const elementType = element.type as ElementsType;
      // For TwoColumnLayoutField, we need to reconstruct the column elements
      if (elementType === 'TwoColumnLayoutField') {
        const reconstructedElement = FormElements[elementType].construct(element.id);
        const typedElement = element as FormElementInstance & {
          extraAttributes: {
            leftColumn: FormElementInstance[];
            rightColumn: FormElementInstance[];
            gap: string;
          }
        };
        
        reconstructedElement.extraAttributes = {
          ...element.extraAttributes,
          gap: typedElement.extraAttributes.gap || "4",
          leftColumn: typedElement.extraAttributes.leftColumn.map((colElement: FormElementInstance) => {
            const colType = colElement.type as ElementsType;
            return {
              ...FormElements[colType].construct(colElement.id),
              extraAttributes: colElement.extraAttributes
            };
          }),
          rightColumn: typedElement.extraAttributes.rightColumn.map((colElement: FormElementInstance) => {
            const colType = colElement.type as ElementsType;
            return {
              ...FormElements[colType].construct(colElement.id),
              extraAttributes: colElement.extraAttributes
            };
          })
        };
        return reconstructedElement;
      }
      // For other elements, just reconstruct normally
      return {
        ...FormElements[elementType].construct(element.id),
        extraAttributes: element.extraAttributes
      };
    });

    setElements(reconstructedElements);
    setSelectedElement(null);
    const theme = form.theme as keyof typeof formThemes || "default";
    setTheme(theme);
    const readyTimeout = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(readyTimeout);
  }, [form, setElements, isReady, setSelectedElement, setTheme]);

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <ImSpinner2 className="animate-spin h-12 w-12" />
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/submit/${form.shareURL}`;

  if (form.published) {
    return (
      <>
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={1000} />
        <div className="flex flex-col items-center justify-center h-[80vh] lg:h-[90vh] container w-full">
          <div className="">
            <h1 className="text-center text-3xl lg:text-4xl font-bold text-black dark:text-white border-b pb-2 mb-8">
              🎊 Form Published 🎊
            </h1>
            <h2 className="text-xl lg:text-2xl font-medium">Share this form</h2>
            <h3 className="text-xl text-muted-foreground border-b pb-10">
              Anyone with the link can view and submit the form
            </h3>
            <div className="my-4 flex flex-col gap-2 items-center w-full border-b pb-4">
              <Input className="w-full" readOnly value={shareUrl} />
              <div className="flex gap-2 w-full">
                <Button
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast({
                      title: "Copied!",
                      description: "Link copied to clipboard",
                    });
                  }}
                >
                  Copy link
                </Button>
                <GenerateCodeBtn id={form.id} />
              </div>
            </div>
            <div className="flex justify-between items-center w-full mt-4">
              <Button asChild variant="link">
                <Link href="/dashboard" className="gap-2">
                  <BsArrowLeft /> Back to dashboard
                </Link>
              </Button>
              <Button asChild variant="link">
                <Link href={shareUrl} target="_blank" className="gap-2">
                  View form <BsArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <DndContext sensors={sensors}>
      <main className="flex h-screen flex-col w-full">
        <nav className="flex justify-between border-b-2 lg:py-4 lg:px-9 py-2 px-4 gap-3 items-center">
          <h2 className="truncate font-medium">
            <span className="text-muted-foreground mr-2">Form:</span>
            {form.name}
          </h2>
          <div className="flex items-center gap-2">
            <ThemeSelector />
            <PreviewDialogBtn />
            {!form.published && (
              <>
                {isSmallScreen ?
                  (
                    <div className="relative">
                      <Button onClick={() => setIsOpen(!isOpen)} size="icon" variant="ghost" className="rounded-full">
                        <PiDotsThreeOutlineVerticalFill className="w-4 h-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                      {isOpen && <div className="absolute z-[1] bg-[#fff] rounded-md border p-4 min-h-30 top-[2.9rem] shadow-md right-0">
                        <div className="flex flex-col gap-3">
                          <SaveFormBtn id={form.id} />
                          <PublishFormBtn id={form.id} />
                          <GenerateCodeBtn id={form.id} />
                        </div>
                      </div>}
                    </div>
                  ) : (
                    <>
                      <SaveFormBtn id={form.id} />
                      <PublishFormBtn id={form.id} />
                      <GenerateCodeBtn id={form.id} />
                    </>
                  )}
              </>
            )}
          </div>
        </nav>
        <div className="flex w-full flex-grow items-center justify-center relative overflow-y-auto h-[200px] bg-accent bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)]">
          <Designer />
        </div>
      </main>
      <DragOverlayWrapper />
    </DndContext>
  );
}

export default FormBuilder;
