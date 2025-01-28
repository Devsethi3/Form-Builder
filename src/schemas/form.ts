import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(4),
  description: z.string().optional(),
  theme: z.string().default("default"),
});

// Available themes for forms
export const formThemes = {
  default: {
    name: "Default",
    styles: {
      background: "bg-background",
      text: "text-foreground",
      border: "border-border",
      input: "bg-background border-input",
      primary: "bg-primary text-primary-foreground",
      muted: "bg-muted text-muted-foreground"
    }
  },
  modern: {
    name: "Modern",
    styles: {
      background: "bg-zinc-50 dark:bg-zinc-900",
      text: "text-zinc-900 dark:text-zinc-50",
      border: "border-zinc-200 dark:border-zinc-700",
      input: "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600",
      primary: "bg-indigo-600 text-white dark:bg-indigo-500",
      muted: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
    }
  },
  elegant: {
    name: "Elegant",
    styles: {
      background: "bg-stone-50 dark:bg-stone-900",
      text: "text-stone-900 dark:text-stone-50",
      border: "border-stone-200 dark:border-stone-700",
      input: "bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600",
      primary: "bg-amber-600 text-white dark:bg-amber-500",
      muted: "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
    }
  }
} as const;

export type FormTheme = keyof typeof formThemes;

export type formSchemaType = z.infer<typeof formSchema>;
