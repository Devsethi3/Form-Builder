import { UpdateFormContent, UpdateFormInput } from "@/action/form";
import { Button } from "./ui/button";
import { HiSaveAs } from "react-icons/hi";
import { useTransition } from "react";
import { toast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { useDesigner, PageConfig } from "@/context/DesignerContext";
import { FaSpinner } from "react-icons/fa";

function SaveFormBtn({ id }: { id: number }) {
  const { elements, isMultiPage, pages } = useDesigner();
  const [loading, startTransition] = useTransition();
  const router = useRouter();

  const updateFormContent = async () => {
    try {
      console.log('Form state before save:', {
        isMultiPage,
        pagesLength: pages?.length || 0,
        elementsLength: elements?.length || 0
      });

      const formData: UpdateFormInput = {
        id,
        content: isMultiPage ? "[]" : JSON.stringify(elements),
        isMultiPage,
        pages: isMultiPage
          ? (pages || []).map((page: PageConfig, index: number) => ({
              elements: JSON.stringify(page.elements),
              config: JSON.stringify(page.config),
              order: index,
            }))
          : [],
      };

      console.log('Sending form data:', formData);

      const result = await UpdateFormContent(formData);
      console.log('Save result:', result);

      toast({
        title: "Success",
        description: "Your form has been saved",
      });
      router.refresh();
    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      className="gap-2"
      disabled={loading}
      onClick={() => {
        startTransition(updateFormContent);
      }}
    >
      <HiSaveAs className="h-4 w-4" />
      Save
      {loading && <FaSpinner className="animate-spin" />}
    </Button>
  );
}

export default SaveFormBtn;
