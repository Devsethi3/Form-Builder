import { FormElementInstance } from "../../FormElements";
import { ColorSchemeType, GradientSchemeType } from "@/lib/colorSchemes";

export type CustomInstance = FormElementInstance & {
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
