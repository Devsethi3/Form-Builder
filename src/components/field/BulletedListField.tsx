"use client";

import { ElementsType, FormElement, FormElementInstance } from "../FormElements";
import { Label } from "../ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { BsListUl } from "react-icons/bs";
import { Textarea } from "../ui/textarea";
import useDesigner from "@/hooks/useDesigner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const type: ElementsType = "BulletedListField";

const bulletStyles = {
  disc: "•",
  circle: "○",
  square: "■",
  dash: "-",
  arrow: "→",
  checkmark: "✓",
  star: "★",
} as const;

const fontSizes = {
  h1: "text-4xl font-bold",
  h2: "text-3xl font-semibold",
  h3: "text-2xl font-normal",
  h4: "text-xl font-normal",
} as const;

type BulletStyle = keyof typeof bulletStyles;
type FontSize = keyof typeof fontSizes;

const extraAttributes = {
  items: "Item 1\nItem 2\nItem 3",
  bulletStyle: "disc" as BulletStyle,
  fontSize: "h3" as FontSize,
};

const propertiesSchema = z.object({
  items: z.string().min(2).max(1000),
  bulletStyle: z.enum(Object.keys(bulletStyles) as [BulletStyle, ...BulletStyle[]]),
  fontSize: z.enum(Object.keys(fontSizes) as [FontSize, ...FontSize[]]),
});

export const BulletedListFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: BsListUl,
    label: "Bulleted List",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: () => true,
};

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

function ListComponent({ items, bulletStyle, fontSize }: { items: string; bulletStyle: BulletStyle; fontSize: FontSize }) {
  const itemsArray = items.split('\n').filter(item => item.trim() !== '');
  
  return (
    <div className="flex justify-center w-full">
      <ul className="list-none space-y-2 w-full max-w-2xl">
        {itemsArray.map((item, index) => (
          <li key={index} className={`flex items-start ${fontSizes[fontSize]}`}>
            <span className="mr-2 min-w-[1.5em] text-center">{bulletStyles[bulletStyle]}</span>
            <span className="flex-1">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { items, bulletStyle, fontSize } = element.extraAttributes;
  
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">Bulleted List</Label>
      <ListComponent items={items} bulletStyle={bulletStyle} fontSize={fontSize} />
    </div>
  );
}

function FormComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { items, bulletStyle, fontSize } = element.extraAttributes;

  return <ListComponent items={items} bulletStyle={bulletStyle} fontSize={fontSize} />;
}

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesigner();
  const form = useForm<propertiesFormSchemaType>({
    resolver: zodResolver(propertiesSchema),
    mode: "onBlur",
    defaultValues: {
      items: element.extraAttributes.items,
      bulletStyle: element.extraAttributes.bulletStyle,
      fontSize: element.extraAttributes.fontSize,
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
          name="items"
          render={({ field }) => (
            <FormItem>
              <FormLabel>List Items (one per line)</FormLabel>
              <FormControl>
                <Textarea
                  rows={5}
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bulletStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bullet Style</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bullet style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(bulletStyles).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value} {key.charAt(0).toUpperCase() + key.slice(1)}
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
      </form>
    </Form>
  );
}
