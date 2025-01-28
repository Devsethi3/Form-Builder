import React from "react";
import FormElementsSidebar from "./FormElementsSidebar";
import PropertiesFormSidebar from "./PropertiesFormSidebar";
import useDesigner from "@/hooks/useDesigner";

function DesignerSidebar() {
  const { selectedElement } = useDesigner();
  return (
    <aside className="w-[400px] max-w-[400px] designer-sidebar flex flex-col flex-grow gap-2 border-l-2 border-muted p-2 lg:p-4 bg-background overflow-y-auto h-full">
      <div className="flex flex-col flex-grow">
        <PropertiesFormSidebar />
        {!selectedElement && <FormElementsSidebar />}
      </div>
    </aside>
  );
}

export default DesignerSidebar;
