export const SOLID_COLOR_SCHEMES = ["blue", "green", "purple", "red", "amber"] as const;
export const GRADIENT_SCHEMES = ["severity", "satisfaction", "temperature"] as const;

export type ColorScheme = {
  selected: string;
  hover: string;
  text: string;
};

export type SolidColorSchemes = {
  [key in typeof SOLID_COLOR_SCHEMES[number]]: ColorScheme;
};

export const solidColorSchemes: SolidColorSchemes = {
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

export type GradientLabel = {
  color: string;
  hover: string;
};

export type GradientScheme = {
  colors: string[];
  labels: {
    start: GradientLabel;
    middle: GradientLabel;
    end: GradientLabel;
  };
};

export type GradientColorSchemes = {
  [key in typeof GRADIENT_SCHEMES[number]]: GradientScheme;
};

export const gradientColorSchemes: GradientColorSchemes = {
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

export type ColorSchemeType = typeof SOLID_COLOR_SCHEMES[number];
export type GradientSchemeType = typeof GRADIENT_SCHEMES[number] | null;
