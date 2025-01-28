import React from "react";
import { Button } from "./ui/button";
import { MdPreview } from "react-icons/md";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { FormElements, ElementsType } from "./FormElements";
import useDesigner from "@/hooks/useDesigner";
import { formThemes } from "@/schemas/form";
import { cn } from "@/lib/utils";

function PreviewDialogBtn() {
  const { elements, theme } = useDesigner();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="gap-2">
          <MdPreview className="h-6 w-6" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="w-screen h-screen max-h-screen max-w-full flex flex-col flex-grow gap-0 p-0">
        <div className="px-4 py-2 border-b">
          <p className="text-lg font-bold text-muted-foreground">Form preview</p>
          <p className="text-sm text-muted-foreground">This is how your form will look like to your users.</p>
        </div>
        <div className="bg-accent flex flex-col flex-grow items-center justify-center p-4 bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)]">
          <div className={cn(
            formThemes[theme].styles.background,
            formThemes[theme].styles.text,
            formThemes[theme].styles.border,
            "w-full max-w-[620px] flex flex-col flex-grow rounded-2xl p-8 overflow-y-auto border"
          )}>
            {elements.map((element) => {
              const FormComponent = FormElements[element.type].formComponent;
              return <FormComponent key={element.id} elementInstance={element} />;
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PreviewDialogBtn;
