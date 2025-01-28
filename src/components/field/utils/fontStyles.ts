export const fontSizes = {
  h1: "text-4xl font-bold",
  h2: "text-3xl font-semibold",
  h3: "text-2xl font-normal",
  h4: "text-xl font-normal",
} as const;

export const alignments = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

export type FontSize = keyof typeof fontSizes;
export type Alignment = keyof typeof alignments;

export const fontSizeSchema = Object.keys(fontSizes) as [FontSize, ...FontSize[]];
export const alignmentSchema = Object.keys(alignments) as [Alignment, ...Alignment[]];
