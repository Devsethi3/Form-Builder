import { solidColorSchemes, gradientColorSchemes, ColorSchemeType, GradientSchemeType } from "@/lib/colorSchemes";

type UseRatingColorsProps = {
  minValue: number;
  maxValue: number;
  colorScheme: ColorSchemeType;
  gradientScheme: GradientSchemeType;
};

export const useRatingColors = ({
  minValue,
  maxValue,
  colorScheme,
  gradientScheme
}: UseRatingColorsProps) => {
  const useGradient = gradientScheme && gradientColorSchemes[gradientScheme];
  const gradientLabels = useGradient ? gradientColorSchemes[gradientScheme].labels : null;
  const solidColors = solidColorSchemes[colorScheme];

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

  return {
    getButtonColors,
    getLabelColor,
    labelColor,
    useGradient,
  };
};
