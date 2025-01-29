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

function Designer() {
    const { elements, addElement, selectedElement, setSelectedElement, removeElement, theme, updateElement } = useDesigner();

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

                addElement(elements.length, newElement);
                return;
            }

            // Handle dropping into columns
            if (isDroppingOverColumn) {
                const type = active.data?.current?.type;
                const columnId = over.data?.current?.columnId;
                const parentId = over.data?.current?.elementId;
                
                // Find the parent TwoColumnLayout element
                const parentIndex = elements.findIndex((el) => el.id === parentId);
                if (parentIndex === -1) return;
                
                const parent = { ...elements[parentIndex] };
                const isDesignerElement = active.data?.current?.isDesignerElement;
                
                let elementToAdd;
                if (isDesignerElement) {
                    // Moving an existing element
                    const activeId = active.data?.current?.elementId;
                    const activeElementIndex = elements.findIndex((el) => el.id === activeId);
                    if (activeElementIndex === -1) return;
                    
                    elementToAdd = { ...elements[activeElementIndex] };
                    // Remove from main elements array if it's there
                    removeElement(activeId);
                    
                    // Also remove from other columns if it exists there
                    const otherColumn = columnId === 'left' ? 'rightColumn' : 'leftColumn';
                    if (parent.type === 'TwoColumnLayoutField' && parent.extraAttributes?.[otherColumn]) {
                        parent.extraAttributes[otherColumn] = (parent.extraAttributes[otherColumn] as FormElementInstance[]).filter(
                            (el: FormElementInstance) => el.id !== activeId
                        );
                    }
                } else {
                    // Creating a new element from sidebar
                    elementToAdd = FormElements[type as ElementsType].construct(idGenerator());
                }
                
                // Add to the appropriate column
                const column = columnId === 'left' ? 'leftColumn' : 'rightColumn';
                if (parent.type === 'TwoColumnLayoutField' && parent.extraAttributes) {
                    parent.extraAttributes[column] = [...(parent.extraAttributes[column] as FormElementInstance[] || []), elementToAdd];
                    
                    // Update the parent element
                    elements[parentIndex] = parent;
                    updateElement(parent.id, parent);
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

                addElement(indexForNewElement, newElement);
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

                addElement(indexForNewElement, activeElement);
            }
        },
    });

    return (
        <div className="flex w-full h-full">
            <div
                className="p-4 w-full"
                onClick={() => {
                    if (selectedElement) setSelectedElement(null);
                }}
            >
                <div
                    ref={droppable.setNodeRef}
                    className={cn(
                        formThemes[theme].styles.background,
                        formThemes[theme].styles.text,
                        formThemes[theme].styles.border,
                        "max-w-[920px] h-full m-auto rounded-xl flex flex-col flex-grow items-center justify-start flex-1 overflow-y-auto border",
                        droppable.isOver && "ring-4 ring-primary ring-inset",
                    )}
                >
                    {!droppable.isOver && elements.length === 0 && (
                        <p className={cn("text-3xl font-bold flex flex-grow items-center", formThemes[theme].styles.muted)}>Drop here</p>
                    )}

                    {droppable.isOver && elements.length === 0 && (
                        <div className="p-4 w-full">
                            <div className="h-[120px] rounded-md bg-primary/20"></div>
                        </div>
                    )}
                    {elements.length > 0 && (
                        <div className="flex flex-col w-full gap-2 p-4">
                            {elements.map((element) => (
                                <DesignerElementWrapper key={element.id} element={element} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <DesignerSidebar />
        </div>
    );
}

export function DesignerElementWrapper({ element }: { element: FormElementInstance }) {
    const { removeElement, selectedElement, setSelectedElement, updateElement } = useDesigner();

    const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);
    const topHalf = useDroppable({
        id: element.id + "-top",
        data: {
            type: element.type,
            elementId: element.id,
            isTopHalfDesignerElement: true,
        },
    });

    const bottomHalf = useDroppable({
        id: element.id + "-bottom",
        data: {
            type: element.type,
            elementId: element.id,
            isBottomHalfDesignerElement: true,
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

    if (draggable.isDragging) return null; // temporary remove the element from designer

    const DesignerElement = FormElements[element.type].designerComponent;
    return (
        <div
            ref={draggable.setNodeRef}
            {...draggable.listeners}
            {...draggable.attributes}
            className="relative min-h-[100px] flex flex-col text-foreground hover:cursor-pointer rounded-md ring-1 ring-accent ring-inset"
            onMouseEnter={() => {
                setMouseIsOver(true);
            }}
            onMouseLeave={() => {
                setMouseIsOver(false);
            }}
            onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(element);
            }}
        >
            <div ref={topHalf.setNodeRef} className="absolute w-full h-1/2 rounded-t-md" />
            <div ref={bottomHalf.setNodeRef} className="absolute  w-full bottom-0 h-1/2 rounded-b-md" />
            {mouseIsOver && (
                <>
                    <div className="absolute right-0 h-full">
                        <Button
                            className="flex justify-center h-full border rounded-md rounded-l-none bg-red-500"
                            variant={"outline"}
                            onClick={(e) => {
                                e.stopPropagation(); // avoid selection of element while deleting
                                removeElement(element.id);
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
            {topHalf.isOver && <div className="absolute top-0 w-full rounded-md h-[7px] bg-primary rounded-b-none" />}
            <div
                className={cn(
                    "flex w-full min-h-[40px] items-center rounded-md px-4 py-2 pointer-events-none",
                    mouseIsOver && "opacity-30",
                    selectedElement?.id === element.id && "ring-2 ring-primary ring-inset",
                    !mouseIsOver && !selectedElement?.id && "hover:ring-2 hover:ring-accent ring-inset"
                )}
            >
                <DesignerElement elementInstance={element} />
            </div>
            {bottomHalf.isOver && <div className="absolute bottom-0 w-full rounded-md h-[7px] bg-primary rounded-t-none" />}
        </div>
    );
}

export default Designer;
