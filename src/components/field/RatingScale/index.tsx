import { BsStarFill } from "react-icons/bs";
import { ElementsType, FormElement, FormElementInstance } from "../../FormElements";
import { DesignerComponent } from "./DesignerComponent";
import { FormComponent } from "./FormComponent";
import { PropertiesComponent } from "./PropertiesComponent";
import { CustomInstance } from "./types";

export const RatingScaleFormElement: FormElement = {
  type: "RatingScaleField",
  construct: (id: string) => ({
    id,
    type: "RatingScaleField",
    extraAttributes: {
      label: "Rating Scale",
      helperText: "Select a value",
      required: false,
      question: "Rate your experience",
      minLabel: "Poor",
      midLabel: "Average",
      maxLabel: "Excellent",
      minValue: 1,
      maxValue: 10,
      colorScheme: "blue",
      gradientScheme: null,
    },
  }),

  designerBtnElement: {
    icon: BsStarFill,
    label: "Rating Scale",
  },

  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;
    if (element.extraAttributes.required) {
      return currentValue.length > 0;
    }
    return true;
  },
};
