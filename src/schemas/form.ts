import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(4),
  description: z.string().optional(),
  theme: z.string().default("default"),
});

// Available themes for forms
export const formThemes = {
  default: {
    name: "Default Light",
    styles: {
      background: "bg-white",
      text: "text-gray-900",
      border: "border-gray-200",
      input: "bg-white border-gray-300",
      primary: "bg-primary text-primary-foreground",
      muted: "bg-gray-50 text-gray-500"
    }
  },
  defaultDark: {
    name: "Default Dark",
    styles: {
      background: "bg-zinc-900",
      text: "text-zinc-50",
      border: "border-zinc-700",
      input: "bg-zinc-800 border-zinc-600",
      primary: "bg-primary text-primary-foreground",
      muted: "bg-zinc-800 text-zinc-400"
    }
  },
  modern: {
    name: "Modern Light",
    styles: {
      background: "bg-white",
      text: "text-zinc-900",
      border: "border-zinc-200",
      input: "bg-white border-zinc-300",
      primary: "bg-indigo-600 text-white",
      muted: "bg-zinc-100 text-zinc-500"
    }
  },
  modernDark: {
    name: "Modern Dark",
    styles: {
      background: "bg-zinc-900",
      text: "text-zinc-50",
      border: "border-zinc-700",
      input: "bg-zinc-800 border-zinc-600",
      primary: "bg-indigo-500 text-white",
      muted: "bg-zinc-800 text-zinc-400"
    }
  },
  elegant: {
    name: "Elegant Light",
    styles: {
      background: "bg-white",
      text: "text-stone-900",
      border: "border-stone-200",
      input: "bg-white border-stone-300",
      primary: "bg-amber-600 text-white",
      muted: "bg-stone-100 text-stone-500"
    }
  },
  elegantDark: {
    name: "Elegant Dark",
    styles: {
      background: "bg-stone-900",
      text: "text-stone-50",
      border: "border-stone-700",
      input: "bg-stone-800 border-stone-600",
      primary: "bg-amber-500 text-white",
      muted: "bg-stone-800 text-stone-400"
    }
  }
} as const;

export type FormTheme = keyof typeof formThemes;

export type formSchemaType = z.infer<typeof formSchema>;
