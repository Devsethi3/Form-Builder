"use client";

import React, { useState } from "react";
import DesignerSidebar from "./DesignerSidebar";
import { DragEndEvent, useDndMonitor, useDraggable, useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ElementsType, FormElementInstance, FormElements } from "./FormElements";
import { idGenerator } from "@/lib/idGenerator";
import { Button } from "./ui/button";
import { BiSolidTrash } from "react-icons/bi";
import useDesigner from "@/hooks/useDesigner";
import { formThemes } from "@/schemas/form";
import PageNavigation from "./PageNavigation";

type ColumnType = 'left' | 'right';

interface TwoColumnLayoutAttributes {
  columns: {
    [key in ColumnType]: FormElementInstance[];
  };
}

interface TwoColumnLayoutInstance extends FormElementInstance {
  type: 'TwoColumnLayoutField';
  extraAttributes: TwoColumnLayoutAttributes;
}

interface DesignerProps {
  elements?: FormElementInstance[];
}

function Designer({ elements: propElements }: DesignerProps) {
    const { 
        elements: contextElements, 
        addElement, 
        selectedElement, 
        setSelectedElement, 
        removeElement, 
        theme, 
        updateElement,
        isMultiPage,
        pages,
        currentPage,
        setPages,
        setElements
    } = useDesigner();

    const elements = propElements || contextElements;

    const droppable = useDroppable({
        id: "designer-drop-area",
        data: {
            isDesignerDropArea: true,
        },
    });

    useDndMonitor({
        onDragEnd: (event: DragEndEvent) => {
            const { active, over } = event;
            if (!active || !over) return;

            const isDesignerBtnElement = active.data?.current?.isDesignerBtnElement;
            const isDroppingOverDesignerDropArea = over.data?.current?.isDesignerDropArea;
            const isDroppingOverColumn = over.data?.current?.isColumnDropArea;

            const droppingSidebarBtnOverDesignerDropArea = isDesignerBtnElement && isDroppingOverDesignerDropArea;

            // First
            if (droppingSidebarBtnOverDesignerDropArea) {
                const type = active.data?.current?.type;
                const newElement = FormElements[type as ElementsType].construct(idGenerator());

                if (isMultiPage) {
                    const updatedPages = [...pages];
                    if (!updatedPages[currentPage]) {
                        updatedPages[currentPage] = {
                            elements: [],
                            config: {
                                navigationType: 'tabs',
                                showPageNumbers: true
                            }
                        };
                    }
                    updatedPages[currentPage].elements.push(newElement);
                    setPages(updatedPages);
                } else {
                    addElement(elements.length, newElement);
                }
                return;
            }

            // Handle dropping into columns
            if (isDroppingOverColumn) {
                const type = active.data?.current?.type;
                const columnId = over.data?.current?.columnId as ColumnType;
                const parentId = over.data?.current?.elementId;
                
                // Find the parent TwoColumnLayout element
                const parentIndex = elements.findIndex((el) => el.id === parentId);
                if (parentIndex === -1) return;

                const parent = elements[parentIndex];
                const isTwoColumnLayout = (el: FormElementInstance): el is TwoColumnLayoutInstance => 
                    el.type === 'TwoColumnLayoutField';
                
                if (!isTwoColumnLayout(parent)) return;

                // Create new element
                const newElement = FormElements[type as ElementsType].construct(idGenerator());

                // Update the appropriate column
                const updatedColumns = { ...parent.extraAttributes.columns };
                updatedColumns[columnId] = [...(updatedColumns[columnId] || []), newElement];

                // Update the parent element
                const updatedParent: TwoColumnLayoutInstance = {
                    ...parent,
                    type: 'TwoColumnLayoutField',
                    extraAttributes: {
                        columns: updatedColumns
                    }
                };

                // Update elements list
                const updatedElements = [...elements];
                updatedElements[parentIndex] = updatedParent;
                
                if (isMultiPage) {
                    const updatedPages = [...pages];
                    updatedPages[currentPage].elements = updatedElements;
                    setPages(updatedPages);
                } else {
                    setElements(updatedElements);
                }
                return;
            }

            const isDroppingOverDesignerElementTopHalf = over.data?.current?.isTopHalfDesignerElement;

            const isDroppingOverDesignerElementBottomHalf = over.data?.current?.isBottomHalfDesignerElement;

            const isDroppingOverDesignerElement =
                isDroppingOverDesignerElementTopHalf || isDroppingOverDesignerElementBottomHalf;

            const droppingSidebarBtnOverDesignerElement = isDesignerBtnElement && isDroppingOverDesignerElement;

            // Second
            if (droppingSidebarBtnOverDesignerElement) {
                const type = active.data?.current?.type;
                const newElement = FormElements[type as ElementsType].construct(idGenerator());

                const overId = over.data?.current?.elementId;

                const overElementIndex = elements.findIndex((el) => el.id === overId);
                if (overElementIndex === -1) {
                    throw new Error("element not found");
                }

                let indexForNewElement = overElementIndex; // i assume i'm on top-half
                if (isDroppingOverDesignerElementBottomHalf) {
                    indexForNewElement = overElementIndex + 1;
                }

                if (isMultiPage) {
                    const updatedPages = [...pages];
                    if (!updatedPages[currentPage]) {
                        updatedPages[currentPage] = {
                            elements: [],
                            config: {
                                navigationType: 'tabs',
                                showPageNumbers: true
                            }
                        };
                    }
                    updatedPages[currentPage].elements.splice(indexForNewElement, 0, newElement);
                    setPages(updatedPages);
                } else {
                    addElement(indexForNewElement, newElement);
                }
                return;
            }

            // Third
            const isDraggingDesignerElement = active.data?.current?.isDesignerElement;

            const draggingDesignerElementOverAnotherDesignerElement =
                isDroppingOverDesignerElement && isDraggingDesignerElement;

            if (draggingDesignerElementOverAnotherDesignerElement) {
                const activeId = active.data?.current?.elementId;
                const overId = over.data?.current?.elementId;

                const activeElementIndex = elements.findIndex((el) => el.id === activeId);

                const overElementIndex = elements.findIndex((el) => el.id === overId);

                if (activeElementIndex === -1 || overElementIndex === -1) {
                    throw new Error("element not found");
                }

                const activeElement = { ...elements[activeElementIndex] };
                removeElement(activeId);

                let indexForNewElement = overElementIndex; // i assume i'm on top-half
                if (isDroppingOverDesignerElementBottomHalf) {
                    indexForNewElement = overElementIndex + 1;
                }

                if (isMultiPage) {
                    const updatedPages = [...pages];
                    if (!updatedPages[currentPage]) {
                        updatedPages[currentPage] = {
                            elements: [],
                            config: {
                                navigationType: 'tabs',
                                showPageNumbers: true
                            }
                        };
                    }
                    updatedPages[currentPage].elements.splice(indexForNewElement, 0, activeElement);
                    setPages(updatedPages);
                } else {
                    addElement(indexForNewElement, activeElement);
                }
            }
        },
    });

    const handleRemoveElement = (id: string) => {
        if (isMultiPage) {
            const updatedPages = [...pages];
            updatedPages[currentPage].elements = updatedPages[currentPage].elements.filter(
                element => element.id !== id
            );
            setPages(updatedPages);
        } else {
            removeElement(id);
        }
    };

    return (
        <div className="flex w-full h-full">
            <div className="p-4 w-full">
                <PageNavigation />
                <div
                    ref={droppable.setNodeRef}
                    className={cn(
                        "bg-background h-full m-auto rounded-xl flex flex-col flex-grow items-center justify-start flex-1 overflow-y-auto max-w-[620px]",
                        droppable.isOver && "ring-2 ring-primary/20",
                        theme && formThemes[theme]
                    )}
                >
                    {!droppable.isOver && (isMultiPage ? pages[currentPage]?.elements.length === 0 : elements.length === 0) && (
                        <p className="text-3xl text-muted-foreground flex flex-grow items-center font-bold">
                            Drop elements here
                        </p>
                    )}

                    {droppable.isOver && (
                        <div className="p-4 w-full">
                            <div className="h-[120px] rounded-md bg-primary/20"></div>
                        </div>
                    )}

                    {isMultiPage ? (
                        <div className="flex flex-col items-center w-full max-w-[500px] mx-auto p-8">
                            {pages[currentPage]?.elements.map((element) => (
                                <DesignerElementWrapper
                                    key={element.id}
                                    element={element}
                                    onRemove={() => handleRemoveElement(element.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center w-full max-w-[500px] mx-auto p-8">
                            {elements.map((element) => (
                                <DesignerElementWrapper
                                    key={element.id}
                                    element={element}
                                    onRemove={() => handleRemoveElement(element.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <DesignerSidebar />
        </div>
    );
}

export interface DesignerElementWrapperProps {
  element: FormElementInstance;
  onRemove: () => void;
}

export function DesignerElementWrapper({ element, onRemove }: DesignerElementWrapperProps) {
    const { setSelectedElement, selectedElement } = useDesigner();

    const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);

    const topHalf = useDroppable({
        id: element.id + "-top",
        data: {
            type: element.type,
            elementId: element.id,
            isTopHalfDroppable: true,
        },
    });

    const bottomHalf = useDroppable({
        id: element.id + "-bottom",
        data: {
            type: element.type,
            elementId: element.id,
            isBottomHalfDroppable: true,
        },
    });

    const draggable = useDraggable({
        id: element.id + "-drag-handler",
        data: {
            type: element.type,
            elementId: element.id,
            isDesignerElement: true,
        },
    });

    if (draggable.isDragging) return null;

    const DesignerElement = FormElements[element.type].designerComponent;

    return (
        <div
            ref={draggable.setNodeRef}
            {...draggable.listeners}
            {...draggable.attributes}
            className="relative h-[120px] w-full hover:cursor-pointer rounded-md ring-1 ring-accent ring-inset mb-4"
            onMouseEnter={() => setMouseIsOver(true)}
            onMouseLeave={() => setMouseIsOver(false)}
            onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(element);
            }}
        >
            <div ref={topHalf.setNodeRef} className="absolute w-full h-1/2 rounded-t-md" />
            <div ref={bottomHalf.setNodeRef} className="absolute w-full bottom-0 h-1/2 rounded-b-md" />
            {mouseIsOver && (
                <>
                    <div className="absolute right-0 h-full">
                        <Button
                            className="flex justify-center h-full border rounded-md rounded-l-none bg-red-500"
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
                        <p className="text-muted-foreground text-sm">Click to edit properties or drag to move</p>
                    </div>
                </>
            )}
            {topHalf.isOver && <div className="absolute top-0 w-full h-[7px] rounded-md bg-primary" />}
            <div
                className={cn(
                    "flex w-full h-[120px] items-center rounded-md bg-accent/40 px-4 py-2 pointer-events-none",
                    mouseIsOver && "opacity-30"
                )}
            >
                <div className="flex flex-col w-full items-center">
                    <DesignerElement elementInstance={element} />
                </div>
            </div>
            {bottomHalf.isOver && <div className="absolute bottom-0 w-full h-[7px] rounded-md bg-primary" />}
        </div>
    );
}

export default Designer;
