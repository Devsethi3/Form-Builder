"use client";

import { ElementsType, FormElement, FormElementInstance, FormElements } from "../FormElements";
import { Label } from "../ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, memo, useState, useCallback } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { LuColumns } from "react-icons/lu";
import useDesigner from "@/hooks/useDesigner";
import { cn } from "@/lib/utils";
import { formThemes } from "@/schemas/form";
import { useDroppable } from "@dnd-kit/core";
import { idGenerator } from "@/lib/idGenerator";
import { DesignerElementWrapper } from "../Designer";
import { Suspense } from "react";

const type: ElementsType = "TwoColumnLayoutField";

const extraAttributes = {
  gap: "4", // Tailwind gap spacing
  leftColumn: [] as FormElementInstance[],
  rightColumn: [] as FormElementInstance[],
};

const propertiesSchema = z.object({
  gap: z.string(),
  leftColumn: z.array(z.any()).default([]),
  rightColumn: z.array(z.any()).default([]),
});

// Create a memoized wrapper for form components
const MemoizedFormComponent = memo(
  ({ element, inDesigner = false }: { element: FormElementInstance; inDesigner?: boolean }) => {
    const { setSelectedElement } = useDesigner();
    
    return (
      <div 
        onClick={(e) => {
          if (inDesigner) {
            e.stopPropagation();
            setSelectedElement(element);
          }
        }}
      >
        {FormElements[element.type].formComponent({
          elementInstance: element,
        })}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.element.id === nextProps.element.id &&
           JSON.stringify(prevProps.element.extraAttributes) === JSON.stringify(nextProps.element.extraAttributes);
  }
);

MemoizedFormComponent.displayName = "MemoizedFormComponent";

export const TwoColumnLayoutFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes: {
      ...extraAttributes,
      leftColumn: [], // Create new arrays for each instance
      rightColumn: [], // Create new arrays for each instance
    },
  }),
  designerBtnElement: {
    icon: LuColumns,
    label: "Two Column Layout",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: () => true,
};

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { gap, leftColumn, rightColumn } = element.extraAttributes;
  const { theme, addElement, selectedElement } = useDesigner();
  const { styles } = formThemes[theme];
  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);

  const droppableLeft = useDroppable({
    id: `${element.id}-left`,
    data: {
      isColumnDropArea: true,
      columnId: "left",
      elementId: element.id,
    },
  });

  const droppableRight = useDroppable({
    id: `${element.id}-right`,
    data: {
      isColumnDropArea: true,
      columnId: "right",
      elementId: element.id,
    },
  });
  
  return (
    <div 
      className="flex flex-col gap-2 w-full relative" 
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
    >
      <Label className="text-muted-foreground">Two Column Layout</Label>
      <div className={cn(
        "grid grid-cols-2 w-full",
        `gap-${gap}`,
        mouseIsOver && selectedElement?.id !== element.id && "opacity-30",
      )}>
        <div
          ref={droppableLeft.setNodeRef}
          className={cn(
            "border-2 border-dashed rounded-md min-h-[150px] p-4",
            droppableLeft.isOver ? "border-primary" : "border-gray-300"
          )}
        >
          {leftColumn.map((element) => (
            <div 
              key={element.id} 
              className="mb-4 w-full relative z-10"
              style={{ pointerEvents: 'auto' }}
            >
              <DesignerElementWrapper element={element} />
            </div>
          ))}
          {!leftColumn.length && (
            <p className={cn("text-center text-muted-foreground", styles.text)}>
              Drop elements here
            </p>
          )}
        </div>
        <div
          ref={droppableRight.setNodeRef}
          className={cn(
            "border-2 border-dashed rounded-md min-h-[150px] p-4",
            droppableRight.isOver ? "border-primary" : "border-gray-300"
          )}
        >
          {rightColumn.map((element) => (
            <div 
              key={element.id} 
              className="mb-4 w-full relative z-10"
              style={{ pointerEvents: 'auto' }}
            >
              <DesignerElementWrapper element={element} />
            </div>
          ))}
          {!rightColumn.length && (
            <p className={cn("text-center text-muted-foreground", styles.text)}>
              Drop elements here
            </p>
          )}
        </div>
      </div>
      {mouseIsOver && selectedElement?.id !== element.id && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse pointer-events-none">
          <p className="text-muted-foreground text-sm">Click for properties or drag to move</p>
        </div>
      )}
    </div>
  );
}

function FormComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { gap, leftColumn, rightColumn } = element.extraAttributes;
  const { theme } = useDesigner();
  const { styles } = formThemes[theme];
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Quick check to ensure form elements exist
    const validateElements = () => {
      try {
        [...leftColumn, ...rightColumn].forEach((element) => {
          if (!FormElements[element.type]) {
            throw new Error(`Form element type ${element.type} not found`);
          }
        });
        return true;
      } catch (error) {
        console.error('Error validating form elements:', error);
        return false;
      }
    };

    validateElements();
    setIsLoading(false);
  }, [leftColumn, rightColumn]);

  const renderColumn = useCallback((elements: FormElementInstance[]) => {
    return elements.map((element) => (
      <div key={element.id} className="mb-4 w-full">
        <div role="alert">
          <Suspense fallback={<div>Loading...</div>}>
            <MemoizedFormComponent element={element} />
          </Suspense>
        </div>
      </div>
    ));
  }, []);

  if (isLoading) {
    return <div>Loading form elements...</div>;
  }

  return (
    <div className={cn("grid grid-cols-2 w-full", `gap-${gap}`)}>
      <div className="w-full">
        {renderColumn(leftColumn)}
      </div>
      <div className="w-full">
        {renderColumn(rightColumn)}
      </div>
    </div>
  );
}

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesigner();
  const form = useForm<propertiesFormSchemaType>({
    resolver: zodResolver(propertiesSchema),
    mode: "onBlur",
    defaultValues: {
      gap: element.extraAttributes.gap,
      leftColumn: element.extraAttributes.leftColumn,
      rightColumn: element.extraAttributes.rightColumn,
    },
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element, form]);

  function applyChanges(values: propertiesFormSchemaType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: values,
    });
  }

  return (
    <Form {...form}>
      <form
        onBlur={() => {
          form.handleSubmit(applyChanges)();
        }}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(applyChanges)();
        }}
        className="space-y-3"
      >
        <FormField
          control={form.control}
          name="gap"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gap Between Columns</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="2">Small</option>
                  <option value="4">Medium</option>
                  <option value="6">Large</option>
                  <option value="8">Extra Large</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;
