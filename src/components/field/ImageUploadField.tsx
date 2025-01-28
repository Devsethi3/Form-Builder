"use client";

import { ElementsType, FormElement, FormElementInstance } from "../FormElements";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useRef } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { BsCardImage } from "react-icons/bs";
import useDesigner from "@/hooks/useDesigner";
import NextImage from "next/image";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

const type: ElementsType = "ImageUploadField";

const extraAttributes = {
  label: "Image Upload",
  helperText: "Upload an image file",
  required: false,
  prompt: "Upload an image",
  buttonText: "Choose File",
  width: "w-96",
  height: "h-64",
  maxDimension: 800,
};

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(50),
  helperText: z.string().max(200),
  required: z.boolean().default(false),
  prompt: z.string().min(2).max(100),
  buttonText: z.string().min(2).max(50),
  width: z.string(),
  height: z.string(),
  maxDimension: z.number().min(100).max(2000),
});

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { label, helperText, required, prompt, buttonText, width, height } = element.extraAttributes;
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-center w-full pb-2">
        {label}
        {required && "*"}
      </Label>
      <div className={`${width} ${height} border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 mx-auto`}>
        <div className="text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
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
  const [fileName, setFileName] = useState("No file chosen");
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultValue || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { prompt, buttonText, width, height, maxDimension } = element.extraAttributes;

  const resizeImage = async (originalFile: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(originalFile);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Calculate new dimensions while maintaining aspect ratio
        let newWidth = img.width;
        let newHeight = img.height;

        if (newWidth > maxDimension || newHeight > maxDimension) {
          if (newWidth > newHeight) {
            newHeight = (newHeight / newWidth) * maxDimension;
            newWidth = maxDimension;
          } else {
            newWidth = (newWidth / newHeight) * maxDimension;
            newHeight = maxDimension;
          }
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], originalFile.name, {
              type: originalFile.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          }
        }, originalFile.type);

        URL.revokeObjectURL(img.src);
      };
    });
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFileName(file.name);

      let finalFile = file;

      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = async () => {
        if (img.width > maxDimension || img.height > maxDimension) {
          finalFile = await resizeImage(file);
        }

        URL.revokeObjectURL(img.src);
        
        // Convert the final image to base64 and set preview
        const base64Data = await convertToBase64(finalFile);
        setPreviewUrl(base64Data);
        
        // Submit the base64 data instead of just the filename
        submitValue?.(elementInstance.id, base64Data);
      };
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className={`${isInvalid ? "text-red-500" : ""} text-center w-full pb-2`}>
        {element.extraAttributes.label}
        {element.extraAttributes.required && "*"}
      </Label>
      <div className={`${width} ${height} border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 mx-auto`}>
        {previewUrl ? (
          <NextImage 
            src={previewUrl}
            alt="Preview"
            width={400}
            height={400}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-sm text-center">{prompt}</p>
          </div>
        )}
      </div>
      <div className="flex justify-center items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          ref={fileInputRef}
        />
        <Button
          onClick={handleButtonClick}
          variant="outline"
          className="px-4 py-2"
        >
          {buttonText}
        </Button>
        <span className="text-sm text-gray-500">{fileName}</span>
      </div>
      {element.extraAttributes.helperText && (
        <p className="text-muted-foreground text-[0.8rem]">{element.extraAttributes.helperText}</p>
      )}
    </div>
  );
}

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesigner();
  const form = useForm<propertiesFormSchemaType>({
    resolver: zodResolver(propertiesSchema),
    mode: "onBlur",
    defaultValues: {
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      required: element.extraAttributes.required,
      prompt: element.extraAttributes.prompt,
      buttonText: element.extraAttributes.buttonText,
      width: element.extraAttributes.width,
      height: element.extraAttributes.height,
      maxDimension: element.extraAttributes.maxDimension,
    },
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element, form]);

  function applyChanges(values: propertiesFormSchemaType) {
    const { label, helperText, required, prompt, buttonText, width, height, maxDimension } = values;
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        label,
        helperText,
        required,
        prompt,
        buttonText,
        width,
        height,
        maxDimension,
      },
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
                    if (e.key === "Enter") e.preventDefault();
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
                    if (e.key === "Enter") e.preventDefault();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt text</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="buttonText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button text</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="width"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Width</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxDimension"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max dimension (px)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
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
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Required</FormLabel>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

export const ImageUploadFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: BsCardImage,
    label: "Image Upload",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string) => {
    return true;
  },
};
