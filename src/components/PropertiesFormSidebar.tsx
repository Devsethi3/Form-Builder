"use client";

import React from "react";
import { FormElements } from "./FormElements";
import FormSettings from "./FormSettings";
import { useDesigner } from "@/context/DesignerContext";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { AiOutlineClose } from "react-icons/ai";
import { MdSettings } from "react-icons/md";

function PropertiesFormSidebar() {
  const { selectedElement, setSelectedElement } = useDesigner();

  if (selectedElement) {
    const PropertiesComponent = FormElements[selectedElement.type].propertiesComponent;

    return (
      <div className="w-[300px] max-w-[300px] flex flex-col flex-grow gap-2 border-l-2 border-muted p-4 bg-background overflow-y-auto h-full">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground/70">Element properties</p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-foreground/70">{selectedElement.type}</p>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedElement(null)}
              >
                <AiOutlineClose className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Separator />
          <PropertiesComponent elementInstance={selectedElement} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-[300px] max-w-[300px] flex flex-col flex-grow gap-2 border-l-2 border-muted p-4 bg-background overflow-y-auto h-full">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <MdSettings className="h-5 w-5" />
          <p className="text-sm text-foreground/70">Form settings</p>
        </div>
        <Separator />
        <FormSettings />
      </div>
    </div>
  );
}

export default PropertiesFormSidebar;
