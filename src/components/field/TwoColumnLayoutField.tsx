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
import { DesignerElementWrapper } from "../DesignerElementWrapper";
import { Suspense } from "react";

const type: ElementsType = "TwoColumnLayoutField";

type ColumnType = 'left' | 'right';

interface TwoColumnLayoutAttributes {
  gap: string;
  columns: {
    [key in ColumnType]: FormElementInstance[];
  };
}

const extraAttributes: TwoColumnLayoutAttributes = {
  gap: "4",
  columns: {
    left: [],
    right: []
  }
};

const propertiesSchema = z.object({
  gap: z.string(),
  columns: z.object({
    left: z.array(z.any()).default([]),
    right: z.array(z.any()).default([])
  })
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
      columns: {
        left: [],
        right: []
      }
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
  extraAttributes: TwoColumnLayoutAttributes;
};

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { gap, columns } = element.extraAttributes;
  const leftColumn = columns.left;
  const rightColumn = columns.right;
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
              <DesignerElementWrapper element={element} onRemove={() => {}} />
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
              <DesignerElementWrapper element={element} onRemove={() => {}} />
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
  const { gap, columns } = element.extraAttributes;
  const leftColumn = columns.left;
  const rightColumn = columns.right;

  return (
    <div className={cn("grid grid-cols-2 w-full", `gap-${gap}`)}>
      <div className="flex flex-col gap-4">
        {leftColumn.map((element) => (
          <MemoizedFormComponent key={element.id} element={element} />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {rightColumn.map((element) => (
          <MemoizedFormComponent key={element.id} element={element} />
        ))}
      </div>
    </div>
  );
}

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesigner();
  const form = useForm<z.infer<typeof propertiesSchema>>({
    resolver: zodResolver(propertiesSchema),
    mode: "onBlur",
    defaultValues: {
      gap: element.extraAttributes.gap,
      columns: element.extraAttributes.columns
    },
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element, form]);

  function applyChanges(values: z.infer<typeof propertiesSchema>) {
    const { gap, columns } = values;
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        gap,
        columns
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(applyChanges)();
        }}
        onBlur={() => {
          form.handleSubmit(applyChanges)();
        }}
        className="space-y-3"
      >
        <FormField
          control={form.control}
          name="gap"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gap</FormLabel>
              <FormControl>
                <input
                  type="number"
                  min="0"
                  max="16"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full border rounded-md h-10 px-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

export type { propertiesSchema as propertiesFormSchemaType };
