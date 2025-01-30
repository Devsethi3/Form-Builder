import { cn } from "@/lib/utils";

type RatingButtonProps = {
  value: number;
  isSelected: boolean;
  onClick: (value: number) => void;
  buttonColors: {
    selected: string;
    hover: string;
  };
};

export const RatingButton = ({
  value,
  isSelected,
  onClick,
  buttonColors,
}: RatingButtonProps) => {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={cn(
        "w-10 h-10 rounded-full border-2 transition-all",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        buttonColors.hover,
        {
          [buttonColors.selected]: isSelected,
          "opacity-50": !isSelected,
        }
      )}
    >
      {value}
    </button>
  );
};
