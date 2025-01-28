import React from "react";
import { FormElements, ElementsType } from "./FormElements";
import { AiOutlineClose } from "react-icons/ai";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import useDesigner from "@/hooks/useDesigner";
import FormSettings from "./FormSettings";
import { MdSettings } from "react-icons/md";

function PropertiesFormSidebar() {
  const { selectedElement, setSelectedElement, theme, setTheme } = useDesigner();
  
  if (!selectedElement) {
    return (
      <div className="flex flex-col p-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MdSettings className="h-5 w-5" />
            <p className="text-sm text-foreground/70">Form settings</p>
          </div>
        </div>
        <Separator className="mb-4" />
        <FormSettings theme={theme} onThemeChange={setTheme} />
      </div>
    );
  }

  const elementType = selectedElement?.type as ElementsType; // Assert type as ElementsType
  const PropertiesForm = FormElements[elementType].propertiesComponent;

  return (
    <div className="flex flex-col p-2">
      <div className="flex justify-between items-center">
        <p className="text-sm text-foreground/70">Element properties</p>
        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={() => {
            setSelectedElement(null);
          }}
        >
          <AiOutlineClose />
        </Button>
      </div>
      <Separator className="mb-4" />
      <PropertiesForm elementInstance={selectedElement} />
    </div>
  );
}

export default PropertiesFormSidebar;
