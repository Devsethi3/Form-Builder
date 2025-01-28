"use client";

import { formThemes } from "@/schemas/form";
import useDesigner from "@/hooks/useDesigner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

export function ThemeSelector() {
    const { theme, setTheme } = useDesigner();

    return (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Theme:</label>
            <Select
                value={theme}
                onValueChange={(value) => setTheme(value as keyof typeof formThemes)}
            >
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(formThemes).map(([key, theme]) => (
                        <SelectItem key={key} value={key}>
                            {theme.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
