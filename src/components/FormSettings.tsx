"use client";

import { formThemes } from "@/schemas/form";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface FormSettingsProps {
  theme: keyof typeof formThemes;
  onThemeChange: (theme: keyof typeof formThemes) => void;
}

function FormSettings({ theme, onThemeChange }: FormSettingsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Form Theme</Label>
        <Select
          value={theme}
          onValueChange={(value) => onThemeChange(value as keyof typeof formThemes)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a theme" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(formThemes).map(([key, theme]) => (
              <SelectItem key={key} value={key}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-sm">
          Choose a theme for your form. This will affect how your form looks when shared.
        </p>
      </div>
    </div>
  );
}

export default FormSettings;
