"use client";

import React, { useCallback, useRef, useState, useTransition } from "react";
import { FormElementInstance, FormElements } from "./FormElements";
import { formThemes } from "@/schemas/form";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { HiCursorClick } from "react-icons/hi";
import { toast } from "./ui/use-toast";
import { ImSpinner2 } from "react-icons/im";
import { SubmitForm } from "@/action/form";

function FormSubmitComponent({ 
  formUrl, 
  content, 
  theme = "default" 
}: { 
  content: FormElementInstance[]; 
  formUrl: string;
  theme?: keyof typeof formThemes;
}) {
  const formValues = useRef<{ [key: string]: string }>({});
  const formErrors = useRef<{ [key: string]: boolean }>({});
  const [renderKey, setRenderKey] = useState(new Date().getTime());

  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  const validateForm: () => boolean = useCallback(() => {
    for (const field of content) {
      const actualValue = formValues.current[field.id] || "";
      const valid = FormElements[field.type].validate(field, actualValue);

      if (!valid) {
        formErrors.current[field.id] = true;
      }
    }

    if (Object.keys(formErrors.current).length > 0) {
      return false;
    }

    return true;
  }, [content]);

  const submitValue = useCallback((key: string, value: string) => {
    formValues.current[key] = value;
  }, []);

  const submitForm = async () => {
    formErrors.current = {};
    const validForm = validateForm();
    if (!validForm) {
      setRenderKey(new Date().getTime());
      toast({
        title: "Error",
        description: "please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    try {
      const jsonContent = JSON.stringify(formValues.current);
      await SubmitForm(formUrl, jsonContent);
      setSubmitted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  if (submitted) {
    return (
      <div className="flex justify-center w-full h-full items-center p-2 lg:p-8">
        <div className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-md dark:shadow-white/20 rounded-md">
          <h1 className="text-2xl font-bold">Form submitted Successfully!🎉</h1>
          <p className="text-muted-foreground">Thank you for submitting the form, you can close this page now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full h-full items-center p-2 lg:p-8">
      <div
        key={renderKey}
        className={`max-w-[620px] flex flex-col gap-4 flex-grow w-full p-8 overflow-y-auto border shadow-md dark:shadow-white/20 rounded-md
          ${formThemes[theme].styles.background}
          ${formThemes[theme].styles.text}
          ${formThemes[theme].styles.border}`}
      >
        {content.map((element) => {
          const FormElement = FormElements[element.type].formComponent;
          return (
            <FormElement
              key={element.id}
              elementInstance={element}
              submitValue={submitValue}
              isInvalid={formErrors.current[element.id]}
              defaultValue={formValues.current[element.id]}
            />
          );
        })}
          <Button
            className={cn(
              "mt-8",
              formThemes[theme].styles.primary
            )}
          onClick={() => {
            startTransition(submitForm);
          }}
          disabled={pending}
        >
          {!pending && (
            <>
              <HiCursorClick className="mr-2" />
              Submit
            </>
          )}
          {pending && <ImSpinner2 className="animate-spin" />}
        </Button>
      </div>
    </div>
  );
}

export default FormSubmitComponent;
