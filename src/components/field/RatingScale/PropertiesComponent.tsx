import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useDesigner from "@/hooks/useDesigner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { FormElementInstance } from "../../FormElements";
import { CustomInstance } from "./types";
import { GRADIENT_SCHEMES, SOLID_COLOR_SCHEMES } from "@/lib/colorSchemes";

const propertiesSchema = z.object({
  label: z.string().min(2).max(50),
  helperText: z.string().max(200),
  required: z.boolean().default(false),
  question: z.string().min(2).max(200),
  minLabel: z.string().min(1).max(50),
  midLabel: z.string().min(1).max(50),
  maxLabel: z.string().min(1).max(50),
  minValue: z.number().min(0).max(100),
  maxValue: z.number().min(0).max(100),
  colorScheme: z.enum(SOLID_COLOR_SCHEMES),
  gradientScheme: z.enum(['none', ...GRADIENT_SCHEMES]).transform((value: string) => value === 'none' ? null : value),
});

type PropertiesFormSchema = z.infer<typeof propertiesSchema>;

type PropertiesComponentProps = {
  elementInstance: FormElementInstance;
};

export const PropertiesComponent = ({ elementInstance }: PropertiesComponentProps) => {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesigner();
  
  const form = useForm<PropertiesFormSchema>({
    resolver: zodResolver(propertiesSchema),
    mode: "onBlur",
    defaultValues: {
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      required: element.extraAttributes.required,
      question: element.extraAttributes.question,
      minLabel: element.extraAttributes.minLabel,
      midLabel: element.extraAttributes.midLabel,
      maxLabel: element.extraAttributes.maxLabel,
      minValue: element.extraAttributes.minValue,
      maxValue: element.extraAttributes.maxValue,
      colorScheme: element.extraAttributes.colorScheme,
      gradientScheme: element.extraAttributes.gradientScheme ?? 'none',
    },
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element, form]);

  function applyChanges(values: PropertiesFormSchema) {
    const { colorScheme, gradientScheme, ...rest } = values;
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...rest,
        colorScheme,
        gradientScheme: gradientScheme === 'none' ? null : gradientScheme,
      },
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
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="helperText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Helper Text</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-3">
          <FormField
            control={form.control}
            name="minLabel"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Min Label</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="midLabel"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Mid Label</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxLabel"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Max Label</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-3">
          <FormField
            control={form.control}
            name="minValue"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Min Value</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxValue"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Max Value</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="colorScheme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color Scheme</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a color scheme" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SOLID_COLOR_SCHEMES.map((scheme) => (
                    <SelectItem key={scheme} value={scheme}>
                      {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
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
          name="gradientScheme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gradient Scheme</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value ?? 'none'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a gradient scheme" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {GRADIENT_SCHEMES.map((scheme) => (
                    <SelectItem key={scheme} value={scheme}>
                      {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
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
};
