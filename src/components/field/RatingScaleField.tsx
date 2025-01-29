"use client";

import { cn } from "@/lib/utils";
import { ElementsType, FormElement, FormElementInstance } from "../FormElements";
import { Label } from "../ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { BsStarFill } from "react-icons/bs";
import useDesigner from "@/hooks/useDesigner";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const SOLID_COLOR_SCHEMES = ["blue", "green", "purple", "red", "amber"] as const;
const GRADIENT_SCHEMES = ["severity", "satisfaction", "temperature"] as const;

type ColorScheme = {
  selected: string;
  hover: string;
  text: string;
};

type SolidColorSchemes = {
  [key in typeof SOLID_COLOR_SCHEMES[number]]: ColorScheme;
};

const solidColorSchemes: SolidColorSchemes = {
  blue: {
    selected: 'bg-blue-500 border-blue-600',
    hover: 'hover:border-blue-400',
    text: 'text-blue-600'
  },
  green: {
    selected: 'bg-green-500 border-green-600',
    hover: 'hover:border-green-400',
    text: 'text-green-600'
  },
  purple: {
    selected: 'bg-purple-500 border-purple-600',
    hover: 'hover:border-purple-400',
    text: 'text-purple-600'
  },
  red: {
    selected: 'bg-red-500 border-red-600',
    hover: 'hover:border-red-400',
    text: 'text-red-600'
  },
  amber: {
    selected: 'bg-amber-500 border-amber-600',
    hover: 'hover:border-amber-400',
    text: 'text-amber-600'
  }
};

type GradientLabel = {
  color: string;
  hover: string;
};

type GradientScheme = {
  colors: string[];
  labels: {
    start: GradientLabel;
    middle: GradientLabel;
    end: GradientLabel;
  };
};

type GradientColorSchemes = {
  [key in typeof GRADIENT_SCHEMES[number]]: GradientScheme;
};

const gradientColorSchemes: GradientColorSchemes = {
  severity: {
    colors: ['green', 'yellow', 'red'],
    labels: {
      start: { color: 'text-green-600', hover: 'hover:border-green-400' },
      middle: { color: 'text-yellow-600', hover: 'hover:border-yellow-400' },
      end: { color: 'text-red-600', hover: 'hover:border-red-400' }
    }
  },
  satisfaction: {
    colors: ['red', 'yellow', 'green'],
    labels: {
      start: { color: 'text-red-600', hover: 'hover:border-red-400' },
      middle: { color: 'text-yellow-600', hover: 'hover:border-yellow-400' },
      end: { color: 'text-green-600', hover: 'hover:border-green-400' }
    }
  },
  temperature: {
    colors: ['blue', 'green', 'red'],
    labels: {
      start: { color: 'text-blue-600', hover: 'hover:border-blue-400' },
      middle: { color: 'text-green-600', hover: 'hover:border-green-400' },
      end: { color: 'text-red-600', hover: 'hover:border-red-400' }
    }
  }
};

type ColorSchemeType = typeof SOLID_COLOR_SCHEMES[number];
type GradientSchemeType = typeof GRADIENT_SCHEMES[number] | null;

type CustomInstance = FormElementInstance & {
  extraAttributes: {
    label: string;
    helperText: string;
    required: boolean;
    question: string;
    minLabel: string;
    midLabel: string;
    maxLabel: string;
    minValue: number;
    maxValue: number;
    colorScheme: ColorSchemeType;
    gradientScheme: GradientSchemeType;
  };
};

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

export const RatingScaleFormElement: FormElement = {
  type: "RatingScaleField",
  construct: (id: string) => ({
    id,
    type: "RatingScaleField",
    extraAttributes: {
      label: "Rating Scale",
      helperText: "Select a value",
      required: false,
      question: "Rate your experience",
      minLabel: "Poor",
      midLabel: "Average",
      maxLabel: "Excellent",
      minValue: 1,
      maxValue: 10,
      colorScheme: "blue",
      gradientScheme: null,
    },
  }),

  designerBtnElement: {
    icon: BsStarFill,
    label: "Rating Scale",
  },

  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;
    if (element.extraAttributes.required) {
      return currentValue.length > 0;
    }
    return true;
  },
};

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { question, minLabel, midLabel, maxLabel, minValue, maxValue, colorScheme } = element.extraAttributes;
  const solidColors = solidColorSchemes[colorScheme];

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-lg font-medium text-center">{question}</Label>
      <div className="flex justify-between items-center mb-4">
        {Array.from({ length: maxValue - minValue + 1 }, (_, i) => i + minValue).map((value) => (
          <div key={value} className="flex flex-col items-center">
            <button
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                bg-white ${solidColors.hover}`}
            >
              <span className="text-sm font-medium">{value}</span>
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-between px-4">
        <span className={`text-sm ${solidColors.text}`}>{minLabel}</span>
        <span className={`text-sm ${solidColors.text}`}>{midLabel}</span>
        <span className={`text-sm ${solidColors.text}`}>{maxLabel}</span>
      </div>
    </div>
  );
}

function FormComponent({
  elementInstance,
  submitValue,
  isInvalid,
  defaultValue,
}: {
  elementInstance: FormElementInstance;
  submitValue?: (key: string, value: string) => void;
  isInvalid?: boolean;
  defaultValue?: string;
}) {
  const element = elementInstance as CustomInstance;
  const [selectedValue, setSelectedValue] = useState<number | null>(defaultValue ? parseInt(defaultValue) : null);
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const {
    question,
    minLabel,
    midLabel,
    maxLabel,
    minValue,
    maxValue,
    colorScheme,
    gradientScheme
  } = element.extraAttributes;

  const useGradient = gradientScheme && gradientColorSchemes[gradientScheme];
  const gradientLabels = useGradient ? gradientColorSchemes[gradientScheme].labels : null;
  const solidColors = solidColorSchemes[colorScheme];

  const values = Array.from(
    { length: maxValue - minValue + 1 },
    (_, i) => i + minValue
  );

  const handleSelection = (value: number) => {
    setSelectedValue(value);
    submitValue?.(elementInstance.id, value.toString());
  };

  const getButtonColors = (value: number) => {
    if (useGradient) {
      const position = (value - minValue) / (maxValue - minValue);
      if (position <= 0.33) {
        return {
          selected: `bg-${gradientColorSchemes[gradientScheme].colors[0]}-500 border-${gradientColorSchemes[gradientScheme].colors[0]}-600`,
          hover: `hover:border-${gradientColorSchemes[gradientScheme].colors[0]}-400`
        };
      } else if (position <= 0.66) {
        return {
          selected: `bg-${gradientColorSchemes[gradientScheme].colors[1]}-500 border-${gradientColorSchemes[gradientScheme].colors[1]}-600`,
          hover: `hover:border-${gradientColorSchemes[gradientScheme].colors[1]}-400`
        };
      } else {
        return {
          selected: `bg-${gradientColorSchemes[gradientScheme].colors[2]}-500 border-${gradientColorSchemes[gradientScheme].colors[2]}-600`,
          hover: `hover:border-${gradientColorSchemes[gradientScheme].colors[2]}-400`
        };
      }
    }
    return {
      selected: solidColors.selected,
      hover: solidColors.hover
    };
  };

  const getLabelColor = (position: 'start' | 'middle' | 'end'): string => {
    if (!useGradient || !gradientLabels) return solidColors.text;
    return gradientLabels[position].color;
  };

  const labelColor = (index: number) => {
    if (!useGradient || !gradientLabels) return solidColors.text;
    const position = (index - minValue) / (maxValue - minValue);
    if (position <= 0.33) {
      return gradientLabels.start.color;
    } else if (position <= 0.66) {
      return gradientLabels.middle.color;
    } else {
      return gradientLabels.end.color;
    }
  };

  const buttonClasses = (index: number) => {
    if (!useGradient) return solidColors.hover;
    const position = (index - minValue) / (maxValue - minValue);
    if (position <= 0.33) {
      return `hover:border-${gradientColorSchemes[gradientScheme].colors[0]}-400`;
    } else if (position <= 0.66) {
      return `hover:border-${gradientColorSchemes[gradientScheme].colors[1]}-400`;
    } else {
      return `hover:border-${gradientColorSchemes[gradientScheme].colors[2]}-400`;
    }
  };

  const selectedClass = (index: number) => {
    if (!useGradient) return solidColors.selected;
    const position = (index - minValue) / (maxValue - minValue);
    if (position <= 0.33) {
      return `bg-${gradientColorSchemes[gradientScheme].colors[0]}-500 border-${gradientColorSchemes[gradientScheme].colors[0]}-600`;
    } else if (position <= 0.66) {
      return `bg-${gradientColorSchemes[gradientScheme].colors[1]}-500 border-${gradientColorSchemes[gradientScheme].colors[1]}-600`;
    } else {
      return `bg-${gradientColorSchemes[gradientScheme].colors[2]}-500 border-${gradientColorSchemes[gradientScheme].colors[2]}-600`;
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label>
        {elementInstance.extraAttributes.label}
        {elementInstance.extraAttributes.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
          <span className={cn("text-sm whitespace-nowrap", labelColor(0))}>{elementInstance.extraAttributes.minLabel}</span>
          <div className="flex-1 flex justify-center">
            <span className={cn("text-sm whitespace-nowrap", labelColor(Math.floor(elementInstance.extraAttributes.maxValue / 2)))}>{elementInstance.extraAttributes.midLabel}</span>
          </div>
          <span className={cn("text-sm whitespace-nowrap", labelColor(elementInstance.extraAttributes.maxValue - 1))}>{elementInstance.extraAttributes.maxLabel}</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2 w-full max-w-3xl mx-auto">
        {Array.from({ length: elementInstance.extraAttributes.maxValue }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSelection(i + 1)}
            className={cn(
              "w-10 h-10 rounded-full border-2 transition-all",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              buttonClasses(i),
              {
                [selectedClass(i)]: selectedValue === i + 1,
                "opacity-50": selectedValue && selectedValue !== i + 1,
              }
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
      {elementInstance.extraAttributes.helperText && (
        <p className={cn("text-muted-foreground text-sm", { "text-red-500": isInvalid })}>
          {elementInstance.extraAttributes.helperText}
        </p>
      )}
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

  function applyChanges(values: propertiesFormSchemaType) {
    const { colorScheme, gradientScheme, ...rest } = values;
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...rest,
        colorScheme: colorScheme as ColorSchemeType,
        gradientScheme: gradientScheme === 'none' ? null : gradientScheme as GradientSchemeType,
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
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Label</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="midLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Middle Label</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Label</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Value</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  max={100}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Value</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  max={100}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="colorScheme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color Scheme</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
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
              <FormLabel>Gradient Scheme (Optional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? 'none'}
              >
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

        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Required</FormLabel>
              </div>
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="accent-primary"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;
