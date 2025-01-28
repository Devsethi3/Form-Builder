"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import useDesigner from "@/hooks/useDesigner"
import { formThemes } from "@/schemas/form"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const { theme } = useDesigner();
  const { styles } = formThemes[theme];

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: cn("flex justify-center pt-1 relative items-center", styles.text),
        caption_label: cn("text-sm font-medium", styles.text),
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          styles.text,
          styles.border
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: cn(
          "rounded-md w-9 font-normal text-[0.8rem]",
          styles.muted
        ),
        row: "flex w-full mt-2",
        cell: cn(
          "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          styles.text
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          styles.text
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          styles.primary
        ),
        day_today: cn("bg-accent", styles.text),
        day_outside: cn(
          "day-outside opacity-50 aria-selected:bg-accent/50 aria-selected:opacity-30",
          styles.muted
        ),
        day_disabled: cn("opacity-50", styles.muted),
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className={styles.text} {...props} />,
        IconRight: ({ ...props }) => <ChevronRight className={styles.text} {...props} />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
