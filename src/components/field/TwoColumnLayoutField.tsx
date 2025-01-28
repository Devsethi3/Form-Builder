"use client";

import { ElementsType, FormElement, FormElementInstance, FormElements } from "../FormElements";
import { Label } from "../ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, memo } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { LuColumns } from "react-icons/lu";
import useDesigner from "@/hooks/useDesigner";
import { cn } from "@/lib/utils";
import { formThemes } from "@/schemas/form";
import { useDroppable } from "@dnd-kit/core";
import { idGenerator } from "@/lib/idGenerator";

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
  ({ element }: { element: FormElementInstance }) => {
    return FormElements[element.type].formComponent({
      elementInstance: element,
    });
  },
  (prevProps, nextProps) => {
    // Custom comparison function to ensure proper updates
    return prevProps.element.id === nextProps.element.id &&
           JSON.stringify(prevProps.element.extraAttributes) === JSON.stringify(nextProps.element.extraAttributes);
  }
);

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
  const { theme, addElement } = useDesigner();
  const { styles } = formThemes[theme];

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
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">Two Column Layout</Label>
      <div className={cn("grid grid-cols-2 w-full", `gap-${gap}`)}>
        <div
          ref={droppableLeft.setNodeRef}
          className={cn(
            "border-2 border-dashed rounded-md min-h-[150px] p-4",
            droppableLeft.isOver ? "border-primary" : "border-gray-300"
          )}
        >
          {leftColumn.map((element) => (
            <div key={element.id} className="mb-4 w-full">
              <MemoizedFormComponent element={element} />
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
            <div key={element.id} className="mb-4 w-full">
              <MemoizedFormComponent element={element} />
            </div>
          ))}
          {!rightColumn.length && (
            <p className={cn("text-center text-muted-foreground", styles.text)}>
              Drop elements here
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FormComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { gap, leftColumn, rightColumn } = element.extraAttributes;
  const { theme } = useDesigner();
  const { styles } = formThemes[theme];

  return (
    <div className={cn("grid grid-cols-2 w-full", `gap-${gap}`)}>
      <div className="w-full">
        {leftColumn.map((element) => (
          <div key={element.id} className="mb-4 w-full">
            <MemoizedFormComponent element={element} />
          </div>
        ))}
      </div>
      <div className="w-full">
        {rightColumn.map((element) => (
          <div key={element.id} className="mb-4 w-full">
            <MemoizedFormComponent element={element} />
          </div>
        ))}
      </div>
    </div>
  );
}

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;

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
