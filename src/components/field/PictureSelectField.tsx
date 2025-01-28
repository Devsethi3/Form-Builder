"use client";

import { ElementsType, FormElement, FormElementInstance } from "../FormElements";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { BsCardImage } from "react-icons/bs";
import { Upload, X } from 'lucide-react';
import useDesigner from "@/hooks/useDesigner";
import Image from "next/image";

type ImageOption = {
  src: string;
  label: string;
};

type CustomInstance = FormElementInstance & {
  extraAttributes: {
    label: string;
    helperText: string;
    required: boolean;
    images: ImageOption[];
  };
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(50),
  helperText: z.string().max(200),
  required: z.boolean().default(false),
  images: z.array(z.object({
    src: z.string(),
    label: z.string()
  }))
});

const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const PictureSelectFormElement: FormElement = {
  type: "PictureSelectField",
  construct: (id: string) => ({
    id,
    type: "PictureSelectField",
    extraAttributes: {
      label: "Picture Select",
      helperText: "Select one of the images",
      required: false,
      images: []
    },
  }),

  designerBtnElement: {
    icon: BsCardImage,
    label: "Picture Select",
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

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { label, helperText, required, images } = element.extraAttributes;

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-center w-full pb-2">
        {label}
        {required && "*"}
      </Label>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {images.map((image, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-full space-y-2">
              <div className="relative">
                <Image
                  src={image.src}
                  alt={image.label}
                  width={400}
                  height={300}
                  className="w-full h-48 object-contain rounded-lg border-2 border-gray-300"
                />
              </div>
              <p className="text-center font-medium">{image.label}</p>
            </div>
          </div>
        ))}
      </div>
      {helperText && <p className="text-muted-foreground text-[0.8rem]">{helperText}</p>}
    </div>
  );
}

function FormComponent({
  elementInstance,
  submitValue,
  isInvalid,
  defaultValue,
}: {
  elementInstance: FormElementInstance;
  submitValue?: (key: string, value: string) => void;
  isInvalid?: boolean;
  defaultValue?: string;
}) {
  const element = elementInstance as CustomInstance;
  const [selectedImage, setSelectedImage] = useState(defaultValue || '');
  const { images, label, helperText, required } = element.extraAttributes;

  const handleImageSelect = (label: string) => {
    setSelectedImage(label);
    submitValue?.(elementInstance.id, label);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className={`${isInvalid ? "text-red-500" : ""} text-center w-full pb-2`}>
        {label}
        {required && "*"}
      </Label>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {images.map((image, index) => (
          <div key={index} className="flex flex-col items-center">
            <label className="cursor-pointer p-2 rounded-lg border-2 hover:bg-gray-50">
              <input
                type="radio"
                name={`imageChoice_${elementInstance.id}`}
                value={image.label}
                checked={selectedImage === image.label}
                onChange={() => handleImageSelect(image.label)}
                className="sr-only"
              />
              <Image
                src={image.src}
                alt={image.label}
                width={400}
                height={300}
                className={`w-full h-48 object-contain rounded-lg ${
                  selectedImage === image.label ? 'ring-4 ring-blue-500' : ''
                }`}
              />
              <p className="mt-2 text-center font-medium">{image.label}</p>
            </label>
          </div>
        ))}
      </div>
      {helperText && (
        <p className={`text-[0.8rem] ${isInvalid ? "text-red-500" : "text-muted-foreground"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesigner();
  const form = useForm<z.infer<typeof propertiesSchema>>({
    resolver: zodResolver(propertiesSchema),
    mode: "onBlur",
    defaultValues: {
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      required: element.extraAttributes.required,
      images: element.extraAttributes.images,
    },
  });

  useEffect(() => {
    form.reset({
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      required: element.extraAttributes.required,
      images: element.extraAttributes.images,
    });
  }, [element, form]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64Image = await convertImageToBase64(file);
      const updatedImages = [...form.getValues("images")];
      updatedImages[index] = {
        ...updatedImages[index],
        src: base64Image
      };
      
      form.setValue("images", updatedImages);
      updateElement(element.id, {
        ...element,
        extraAttributes: {
          ...element.extraAttributes,
          images: updatedImages
        }
      });
    } catch (error) {
      console.error("Error converting image:", error);
    }
  };

  const handleLabelChange = (index: number, newLabel: string) => {
    const newImages = [...form.getValues("images")];
    newImages[index] = {
      ...newImages[index],
      label: newLabel
    };
    form.setValue("images", newImages);
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        images: newImages
      }
    });
  };

  const addImage = () => {
    const newImages = [...form.getValues("images"), { 
      src: 'https://placehold.co/200x200',
      label: `Option ${form.getValues("images").length + 1}`
    }];
    form.setValue("images", newImages);
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        images: newImages
      }
    });
  };

  const removeImage = (index: number) => {
    const newImages = form.getValues("images").filter((_, i) => i !== index);
    form.setValue("images", newImages);
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        images: newImages
      }
    });
  };

  function applyChanges(values: propertiesFormSchemaType) {
    const newValues = {
      ...values,
    };
    updateElement(element.id, {
      ...element,
      extraAttributes: newValues,
    });
  }

  return (
    <Form {...form}>
      <form
        onBlur={form.handleSubmit(applyChanges)}
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="space-y-3"
      >
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="helperText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Helper text</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Required</FormLabel>
              </div>
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="accent-primary"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Image Options</FormLabel>
          <div className="grid grid-cols-2 gap-4">
            {form.getValues("images").map((image, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-full space-y-2">
                  <div className="relative">
                    <label className="cursor-pointer p-2 rounded-lg border-2 hover:bg-gray-50 block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, index)}
                        className="sr-only"
                      />
                      <Image
                        src={image.src}
                        alt={image.label}
                        width={400}
                        height={300}
                        className="w-full h-48 object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <Input
                    type="text"
                    value={image.label}
                    onChange={(e) => handleLabelChange(index, e.target.value)}
                    className="w-full"
                    placeholder="Enter label"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addImage}
            className="w-full border-2 border-dashed border-gray-300 p-4 rounded-lg hover:bg-gray-50"
          >
            Add Image Option
          </button>
        </div>
      </form>
    </Form>
  );
}
