import { FormElementInstance } from "../../FormElements";
import { Label } from "../../ui/label";
import { CustomInstance } from "./types";
import { useRatingColors } from "./useRatingColors";

type DesignerComponentProps = {
  elementInstance: FormElementInstance;
};

export const DesignerComponent = ({ elementInstance }: DesignerComponentProps) => {
  const element = elementInstance as CustomInstance;
  const { question, minLabel, midLabel, maxLabel, minValue, maxValue, colorScheme, gradientScheme } = element.extraAttributes;
  
  const { labelColor } = useRatingColors({
    minValue,
    maxValue,
    colorScheme,
    gradientScheme
  });

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-lg font-medium text-center">{question}</Label>
      <div className="flex justify-between items-center mb-4">
        {Array.from({ length: maxValue - minValue + 1 }, (_, i) => i + minValue).map((value) => (
          <div key={value} className="flex flex-col items-center">
            <button
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white hover:border-blue-400"
            >
              <span className="text-sm font-medium">{value}</span>
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-between px-4">
        <span className={labelColor(0)}>{minLabel}</span>
        <span className={labelColor(Math.floor(maxValue / 2))}>{midLabel}</span>
        <span className={labelColor(maxValue - 1)}>{maxLabel}</span>
      </div>
    </div>
  );
};
