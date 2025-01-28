import { CheckboxFieldFormElement } from "./field/CheckBoxField";
import { DateFieldFormElement } from "./field/DateField";
import { NumberFieldFormElement } from "./field/NumberField";
import { ParagprahFieldFormElement } from "./field/ParagraphField";
import { PictureSelectFormElement } from "./field/PictureSelectField";
import { SelectFieldFormElement } from "./field/SelectField";
import { SeparatorFieldFormElement } from "./field/SeparatorField";
import { SpacerFieldFormElement } from "./field/SpacerField";
import { SubTitleFieldFormElement } from "./field/SubTitleField";
import { TextAreaFormElement } from "./field/TextAreaField";
import { TextFieldFormElement } from "./field/TextField";
import { TitleFieldFormElement } from "./field/TitleField";
import { DualImageUploadFormElement } from "./field/DualImageUpload";
import { ImageUploadFormElement } from "./field/ImageUploadField";
import { RatingScaleFormElement } from "./field/RatingScaleField";
import { ImageFormElement } from "./field/ImageElement";
import { BulletedListFieldFormElement } from "./field/BulletedListField";

export type ElementsType =
  | "TextField"
  | "TitleField"
  | "SubTitleField"
  | "ParagraphField"
  | "SeparatorField"
  | "SpacerField"
  | "NumberField"
  | "TextAreaField"
  | "DateField"
  | "SelectField"
  | "CheckboxField"
  | "ImageField"
  | "ImageUploadField"
  | "BulletedListField"
  | "RatingScaleField"
  | "DualImageUpload"
  | "PictureSelectField";

export type SubmitFunction = (key: string, value: string) => void;

export type FormElement = {
  type: ElementsType;

  construct: (id: string) => FormElementInstance;

  designerBtnElement: {
    icon: React.ElementType;
    label: string;
  };

  designerComponent: React.FC<{
    elementInstance: FormElementInstance;
  }>;
  formComponent: React.FC<{
    elementInstance: FormElementInstance;
    submitValue?: SubmitFunction;
    isInvalid?: boolean;
    defaultValue?: string;
  }>;
  propertiesComponent: React.FC<{
    elementInstance: FormElementInstance;
  }>;

  validate: (formElement: FormElementInstance, currentValue: string) => boolean;
};

export type FormElementInstance = {
  id: string;
  type: ElementsType;
  extraAttributes?: Record<string, any>;
};

type FormElementsType = {
  [key in ElementsType]: FormElement;
};

export const FormElements = {
  TextField: TextFieldFormElement,
  TitleField: TitleFieldFormElement,
  SubTitleField: SubTitleFieldFormElement,
  ParagraphField: ParagprahFieldFormElement,
  SeparatorField: SeparatorFieldFormElement,
  SpacerField: SpacerFieldFormElement,
  NumberField: NumberFieldFormElement,
  TextAreaField: TextAreaFormElement,
  DateField: DateFieldFormElement,
  SelectField: SelectFieldFormElement,
  CheckboxField: CheckboxFieldFormElement,
  ImageField: ImageFormElement,
  ImageUploadField: ImageUploadFormElement,
  DualImageUpload: DualImageUploadFormElement,
  RatingScaleField: RatingScaleFormElement,
  PictureSelectField: PictureSelectFormElement,
  BulletedListField: BulletedListFieldFormElement,
} satisfies FormElementsType;
