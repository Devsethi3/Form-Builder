import { cn } from "@/lib/utils";
import { FormElementInstance } from "../../FormElements";
import { Label } from "../../ui/label";
import { useState } from "react";
import { useRatingColors } from "./useRatingColors";
import { RatingButton } from "./RatingButton";
import { CustomInstance } from "./types";

type FormComponentProps = {
  elementInstance: FormElementInstance;
  submitValue?: (key: string, value: string) => void;
  isInvalid?: boolean;
  defaultValue?: string;
};

export const FormComponent = ({
  elementInstance,
  submitValue,
  isInvalid,
  defaultValue,
}: FormComponentProps) => {
  const element = elementInstance as CustomInstance;
  const [selectedValue, setSelectedValue] = useState<number | null>(
    defaultValue ? parseInt(defaultValue) : null
  );

  const {
    question,
    minLabel,
    midLabel,
    maxLabel,
    minValue,
    maxValue,
    colorScheme,
    gradientScheme,
    helperText,
    required,
    label
  } = element.extraAttributes;

  const { getButtonColors, labelColor } = useRatingColors({
    minValue,
    maxValue,
    colorScheme,
    gradientScheme
  });

  const handleSelection = (value: number) => {
    setSelectedValue(value);
    submitValue?.(elementInstance.id, value.toString());
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
          <span className={cn("text-sm whitespace-nowrap", labelColor(0))}>
            {minLabel}
          </span>
          <div className="flex-1 flex justify-center">
            <span
              className={cn(
                "text-sm whitespace-nowrap",
                labelColor(Math.floor(maxValue / 2))
              )}
            >
              {midLabel}
            </span>
          </div>
          <span
            className={cn("text-sm whitespace-nowrap", labelColor(maxValue - 1))}
          >
            {maxLabel}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2 w-full max-w-3xl mx-auto">
        {Array.from({ length: maxValue }, (_, i) => {
          const value = i + 1;
          return (
            <RatingButton
              key={value}
              value={value}
              isSelected={selectedValue === value}
              onClick={handleSelection}
              buttonColors={getButtonColors(value)}
            />
          );
        })}
      </div>
      {helperText && (
        <p
          className={cn("text-muted-foreground text-sm", {
            "text-red-500": isInvalid,
          })}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
