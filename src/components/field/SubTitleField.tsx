"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ElementsType, FormElement, FormElementInstance } from "../FormElements";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { LuHeading2 } from "react-icons/lu";
import useDesigner from "@/hooks/useDesigner";
import { fontSizes, FontSize, fontSizeSchema, alignments, Alignment, alignmentSchema } from "./utils/fontStyles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "@/lib/utils"; // Fix cn import to use @/lib/utils
import { formThemes } from "@/schemas/form";

const type: ElementsType = "SubTitleField";

const extraAttributes = {
  subTitle: "Subtitle",
  fontSize: "h2" as FontSize,
  alignment: "center" as Alignment,
};

const propertiesSchema = z.object({
  subTitle: z.string().min(2).max(50),
  fontSize: z.enum(fontSizeSchema),
  alignment: z.enum(alignmentSchema),
});

export const SubTitleFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: LuHeading2,
    label: "Subtitle",
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
  const { subTitle, fontSize, alignment } = element.extraAttributes;
  const { theme } = useDesigner();
  const { styles } = formThemes[theme];

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">Subtitle field</Label>
      <p className={cn(fontSizes[fontSize], alignments[alignment], styles.text)}>{subTitle}</p>
    </div>
  );
}

function FormComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { subTitle, fontSize, alignment } = element.extraAttributes;
  const { theme } = useDesigner();
  const { styles } = formThemes[theme];

  return <p className={cn(fontSizes[fontSize], alignments[alignment], styles.text)}>{subTitle}</p>;
}

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesigner();
  const form = useForm<propertiesFormSchemaType>({
    resolver: zodResolver(propertiesSchema),
    mode: "onBlur",
    defaultValues: {
      subTitle: element.extraAttributes.subTitle,
      fontSize: element.extraAttributes.fontSize,
      alignment: element.extraAttributes.alignment,
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
        onBlur={form.handleSubmit(applyChanges)}
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="space-y-3"
      >
        <FormField
          control={form.control}
          name="subTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtitle</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fontSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Font Size</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a font size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.keys(fontSizes).map((key) => (
                    <SelectItem key={key} value={key}>
                      {key.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alignment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text Alignment</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select text alignment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.keys(alignments).map((key) => (
                    <SelectItem key={key} value={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}