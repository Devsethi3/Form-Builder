import React, { useTransition } from "react";
import { Button } from "./ui/button";
import { HiSaveAs } from "react-icons/hi";
import useDesigner from "@/hooks/useDesigner";
import { toast } from "./ui/use-toast";
import { FaSpinner } from "react-icons/fa";
import { UpdateFormContent } from "@/action/form";
import { useRouter } from "next/navigation";

function SaveFormBtn({ id }: { id: number }) {
  const { elements, theme } = useDesigner();
  const [loading, startTransition] = useTransition();
  const router = useRouter();

  const updateFormContent = async () => {
    try {
      const jsonElements = JSON.stringify(elements);
      await UpdateFormContent(id, jsonElements, theme);
      // Force a revalidation of the data
      router.refresh();
      toast({
        title: "Success",
        description: "Your form has been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };
  return (
    <Button
      variant={"outline"}
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
