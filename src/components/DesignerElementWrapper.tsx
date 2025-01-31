"use client";

import React, { useState } from "react";
import { FormElementInstance } from "./FormElements";
import { useDesigner } from "@/context/DesignerContext";
import { useDraggable } from "@dnd-kit/core";
import { Button } from "./ui/button";
import { BiSolidTrash } from "react-icons/bi";
import { cn } from "@/lib/utils";

export interface DesignerElementWrapperProps {
  element: FormElementInstance;
  onRemove: () => void;
}

export function DesignerElementWrapper({ element, onRemove }: DesignerElementWrapperProps) {
  const { setSelectedElement, selectedElement } = useDesigner();

  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);

  const topHalf = useDraggable({
    id: element.id + "-top",
    data: {
      type: element.type,
      elementId: element.id,
      isTopHalfDesignerElement: true,
      isDesignerElement: true,
    },
  });

  const bottomHalf = useDraggable({
    id: element.id + "-bottom",
    data: {
      type: element.type,
      elementId: element.id,
      isBottomHalfDesignerElement: true,
      isDesignerElement: true,
    },
  });

  const handleMouseEnter = () => {
    setMouseIsOver(true);
  };

  const handleMouseLeave = () => {
    setMouseIsOver(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(element);
  };

  return (
    <div
      className="relative h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div
        ref={topHalf.setNodeRef}
        {...topHalf.listeners}
        {...topHalf.attributes}
        className="absolute w-full h-1/2"
      />
      <div
        ref={bottomHalf.setNodeRef}
        {...bottomHalf.listeners}
        {...bottomHalf.attributes}
        className="absolute w-full bottom-0 h-1/2"
      />
      {mouseIsOver && (
        <>
          <div className="absolute right-0 h-full">
            <Button
              className="flex justify-center h-full border rounded-none bg-red-500"
              variant={"outline"}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <BiSolidTrash className="h-6 w-6" />
            </Button>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse">
            <p className="text-muted-foreground text-sm">Click for properties or drag to move</p>
          </div>
        </>
      )}
      <div
        className={cn(
          "flex w-full h-full rounded-md",
          mouseIsOver && "border-2 border-primary",
          selectedElement?.id === element.id && "border-2 border-primary ring-2 ring-primary ring-offset-2"
        )}
      >
        <div className="flex w-full h-full items-center rounded-md px-4 py-2 pointer-events-none">
          {mouseIsOver ? (
            <p className="text-muted-foreground text-sm">Click for properties or drag to move</p>
          ) : (
            <div className="w-full">{element.type}</div>
          )}
        </div>
      </div>
    </div>
  );
}
