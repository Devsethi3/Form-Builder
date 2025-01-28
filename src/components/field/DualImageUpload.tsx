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

type CustomInstance = FormElementInstance & {
  extraAttributes: {
    label: string;
    helperText: string;
    required: boolean;
    prompt: string;
    buttonText: string;
    width: string;
    height: string;
    maxDimension: number;
  };
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

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;

export const DualImageUploadFormElement: FormElement = {
  type: "DualImageUpload",
  construct: (id: string) => ({
    id,
    type: "DualImageUpload",
    extraAttributes: {
      label: "Dual Image Upload",
      helperText: "Upload two image files",
      required: false,
      prompt: "Upload two images",
      buttonText: "Choose Files",
      width: "w-64",
      height: "h-48",
      maxDimension: 800,
    },
  }),

  designerBtnElement: {
    icon: BsCardImage,
    label: "Dual Image Upload",
  },

  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;
    if (element.extraAttributes.required) {
      try {
        const parsedValue = JSON.parse(currentValue);
        return Array.isArray(parsedValue) && parsedValue.length === 2 && parsedValue.every(value => value.length > 0);
      } catch (e) {
        return false;
      }
    }
    return true;
  },
};

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
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([null, null]);
  const [fileNames, setFileNames] = useState(["No file chosen", "No file chosen"]);
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const { prompt, buttonText, width, height, maxDimension } = element.extraAttributes;

  useEffect(() => {
    if (defaultValue) {
      try {
        const parsedNames = JSON.parse(defaultValue);
        if (Array.isArray(parsedNames)) {
          setFileNames(parsedNames);
        }
      } catch (e) {
        console.error("Failed to parse default value:", e);
      }
    }
  }, [defaultValue]);

  const resizeImage = (originalFile: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(originalFile);
      
      img.onload = () => {
        let newWidth = img.width;
        let newHeight = img.height;
        
        if (img.width > maxDimension || img.height > maxDimension) {
          if (img.width > img.height) {
            newWidth = maxDimension;
            newHeight = (img.height / img.width) * maxDimension;
          } else {
            newHeight = maxDimension;
            newWidth = (img.width / img.height) * maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
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
        }

        URL.revokeObjectURL(img.src);
      };
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const newFileNames = [...fileNames];
      newFileNames[index] = file.name;
      setFileNames(newFileNames);

      const reader = new FileReader();
      reader.onload = () => {
        const newPreviewUrls = [...previewUrls];
        newPreviewUrls[index] = reader.result as string;
        setPreviewUrls(newPreviewUrls);
      };
      reader.readAsDataURL(file);

      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = async () => {
        let finalFile = file;

        if (img.width > maxDimension || img.height > maxDimension) {
          finalFile = await resizeImage(file);
        }

        URL.revokeObjectURL(img.src);
        const newFileNames = [...fileNames];
        newFileNames[index] = finalFile.name;
        setFileNames(newFileNames);
        submitValue?.(elementInstance.id, JSON.stringify(newFileNames));
      };
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className={`${isInvalid ? "text-red-500" : ""} text-center w-full pb-2`}>
        {element.extraAttributes.label}
        {element.extraAttributes.required && "*"}
      </Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto w-full">
        {[0, 1].map((i) => (
          <div key={i} className={`${height} border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 mx-auto w-64`}>
            {previewUrls[i] ? (
              <NextImage 
                src={previewUrls[i] || ''} 
                alt="Preview" 
                width={256}
                height={256}
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
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="text-sm text-gray-600 max-w-prose text-center px-4 whitespace-normal">
        {prompt}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto w-full">
        {[0, 1].map((i) => (
          <div key={i} className="flex w-64 mx-auto">
            <input
              type="file"
              ref={fileInputRefs[i]}
              onChange={(e) => handleFileSelect(e, i)}
              accept="image/*"
              className="hidden"
            />
            <div 
              className="flex w-full cursor-pointer"
              onClick={() => fileInputRefs[i].current?.click()}
            >
              <div className="bg-blue-500 text-white px-4 py-2 rounded-l-lg hover:bg-blue-600 transition-colors duration-200">
                {buttonText}
              </div>
              <div className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 truncate rounded-r-lg border-y border-r border-gray-200">
                {fileNames[i]}
              </div>
            </div>
          </div>
        ))}
      </div>
      {element.extraAttributes.helperText && (
        <p className={`text-[0.8rem] ${isInvalid ? "text-red-500" : "text-muted-foreground"}`}>
          {element.extraAttributes.helperText}
        </p>
      )}
    </div>
  );
}

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
    updateElement(element.id, {
      ...element,
      extraAttributes: values,
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
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt Text</FormLabel>
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
          name="buttonText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button Text</FormLabel>
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
          name="width"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Width (Tailwind class)</FormLabel>
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
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height (Tailwind class)</FormLabel>
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
          name="maxDimension"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Dimension (pixels)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={100}
                  max={2000}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
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
      </form>
    </Form>
  );
}
