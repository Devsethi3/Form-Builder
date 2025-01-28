"use client";

import { FormElement, FormElementInstance } from "../FormElements";
import { Label } from "../ui/label";
import { z } from "zod";
import { Image as ImageIcon } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import useDesigner from "@/hooks/useDesigner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

type ImageInstance = FormElementInstance & {
  extraAttributes: {
    base64Image: string;
    height: number;
    width: number;
    maintainAspectRatio: boolean;
    alignment: "left" | "center" | "right";
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    maxDimension: number;
  };
};

const propertiesSchema = z.object({
  base64Image: z.string(),
  height: z.number().min(1).max(2000),
  width: z.number().min(1).max(2000),
  maintainAspectRatio: z.boolean().default(true),
  alignment: z.enum(["left", "center", "right"]).default("center"),
  marginTop: z.number().min(0).max(100),
  marginBottom: z.number().min(0).max(100),
  marginLeft: z.number().min(0).max(100),
  marginRight: z.number().min(0).max(100),
  maxDimension: z.number().min(100).max(2000),
});

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;

export const ImageFormElement: FormElement = {
  type: "ImageElement",
  construct: (id: string) => ({
    id,
    type: "ImageElement",
    extraAttributes: {
      base64Image: "",
      height: 200,
      width: 200,
      maintainAspectRatio: true,
      alignment: "center",
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      maxDimension: 800,
    },
  }),

  designerBtnElement: {
    icon: ImageIcon,
    label: "Image",
  },

  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: () => true, // Images don't need validation
};

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as ImageInstance;
  const { base64Image, height, width, maintainAspectRatio, alignment, marginTop, marginBottom, marginLeft, marginRight } = element.extraAttributes;
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="w-full"
      style={{
        textAlign: alignment,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        marginLeft: `${marginLeft}px`,
        marginRight: `${marginRight}px`,
      }}
    >
      {base64Image ? (
        <img
          src={base64Image}
          style={{
            height: `${height}px`,
            width: `${width}px`,
            objectFit: maintainAspectRatio ? "contain" : "fill",
            display: "inline-block"
          }}
          alt="Form Image"
        />
      ) : (
        <div 
          className="h-[200px] w-[200px] bg-muted rounded-md flex items-center justify-center cursor-pointer mx-auto"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={() => {}} // Designer mode doesn't need file handling
          />
        </div>
      )}
    </div>
  );
}

function FormComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as ImageInstance;
  return <DesignerComponent elementInstance={element} />;
}

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as ImageInstance;
  const { updateElement } = useDesigner();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<propertiesFormSchemaType>({
    resolver: zodResolver(propertiesSchema),
    mode: "onBlur",
    defaultValues: {
      base64Image: element.extraAttributes.base64Image,
      height: element.extraAttributes.height,
      width: element.extraAttributes.width,
      maintainAspectRatio: element.extraAttributes.maintainAspectRatio,
      alignment: element.extraAttributes.alignment,
      marginTop: element.extraAttributes.marginTop,
      marginBottom: element.extraAttributes.marginBottom,
      marginLeft: element.extraAttributes.marginLeft,
      marginRight: element.extraAttributes.marginRight,
      maxDimension: element.extraAttributes.maxDimension,
    },
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element, form]);

  function applyChanges(values: propertiesFormSchemaType) {
    const { base64Image, ...otherValues } = values;
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...otherValues,
        base64Image: element.extraAttributes.base64Image, // Preserve the existing image
      },
    });
  }

  const resizeImage = (originalFile: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = document.createElement('img') as HTMLImageElement;
      img.src = URL.createObjectURL(originalFile);
      
      img.onload = () => {
        let newWidth = img.width;
        let newHeight = img.height;
        
        if (img.width > element.extraAttributes.maxDimension || img.height > element.extraAttributes.maxDimension) {
          if (img.width > img.height) {
            newWidth = element.extraAttributes.maxDimension;
            newHeight = (img.height / img.width) * element.extraAttributes.maxDimension;
          } else {
            newHeight = element.extraAttributes.maxDimension;
            newWidth = (img.width / img.height) * element.extraAttributes.maxDimension;
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
      let finalFile = file;
      
      const img = document.createElement('img') as HTMLImageElement;
      img.src = URL.createObjectURL(file);
      
      img.onload = async () => {
        if (img.width > element.extraAttributes.maxDimension || img.height > element.extraAttributes.maxDimension) {
          finalFile = await resizeImage(file);
        }
        
        URL.revokeObjectURL(img.src);
        
        // Convert the final image to base64
        const base64Data = await convertToBase64(finalFile);
        updateElement(element.id, {
          ...element,
          extraAttributes: {
            ...element.extraAttributes,
            base64Image: base64Data,
          },
        });
      };
    }
  };

  return (
    <Form {...form}>
      <form
        onBlur={form.handleSubmit(applyChanges)}
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="space-y-3"
      >
        <div className="flex flex-col gap-2">
          <Label>Upload Image</Label>
          <div 
            className="w-full h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer bg-gray-50"
            onClick={() => fileInputRef.current?.click()}
          >
            {element.extraAttributes.base64Image ? (
              <img
                src={element.extraAttributes.base64Image}
                alt="Uploaded"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-gray-400">
                <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                <p>Click to upload image</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height (px)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
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
              <FormLabel>Width (px)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
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
          name="maintainAspectRatio"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={e => field.onChange(e.target.checked)}
                />
              </FormControl>
              <FormLabel>Maintain Aspect Ratio</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alignment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alignment</FormLabel>
              <FormControl>
                <select
                  className="w-full px-2 py-1 border rounded"
                  value={field.value}
                  onChange={e => field.onChange(e.target.value)}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="marginTop"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Margin Top (px)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
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
          name="marginBottom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Margin Bottom (px)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
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
          name="marginLeft"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Margin Left (px)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
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
          name="marginRight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Margin Right (px)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
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
              <FormLabel>Max Dimension (px)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground">Images larger than this will be automatically resized</p>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
