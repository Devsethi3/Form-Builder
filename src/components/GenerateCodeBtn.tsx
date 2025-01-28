import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect, useCallback } from "react";
import { FaCode, FaCopy } from "react-icons/fa";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { GenerateEmbedCode } from "@/action/form-embed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import EmbedFormPreview from "./EmbedFormPreview";
import { GetFormById } from "@/action/form";

function FormPreviewTab({ id }: { id: number }) {
  return (
    <div className="w-full bg-white rounded-md p-4">
      <EmbedFormPreview key={`preview-${id}`} formId={id} previewMode />
    </div>
  );
}

function GenerateCodeBtn({ id }: { id: number }) {
  const [loading, startTransition] = useTransition();
  const [embedCode, setEmbedCode] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("embedCode");
  const router = useRouter();

  const generateEmbedCode = useCallback(async () => {
    try {
      // Check if form is published first
      const form = await GetFormById(id);
      if (!form?.published) {
        toast({
          title: "Form not published",
          description: "Please publish your form before generating the embed code.",
          variant: "destructive",
        });
        setOpen(false);
        return;
      }

      const code = await GenerateEmbedCode(id);
      setEmbedCode(code.embedCode);
      toast({
        title: "Success",
        description: "Embed code has been generated. Click the copy button to copy it.",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while generating the embed code.",
        variant: "destructive",
      });
    }
  }, [id, router]);

  useEffect(() => {
    if (open) {
      startTransition(generateEmbedCode);
    }
  }, [open, generateEmbedCode]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      toast({
        title: "Copied!",
        description: "Embed code copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="gap-2 text-white bg-gradient-to-r from-indigo-400 to-cyan-400">
          <FaCode className="h-4 w-4" />
          Embed
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Generate Embed Code?</AlertDialogTitle>
          <AlertDialogDescription>
            This will generate an embed code for your form. Make sure to publish your form first!
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="embedCode">Embed Code</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="embedCode" className="space-y-4">
            <div className="w-full bg-slate-950 rounded-md p-4">
              <div className="flex items-center justify-between">
                <pre className="text-white text-sm">{embedCode}</pre>
                {embedCode && (
                  <Button onClick={copyToClipboard} variant="outline" size="icon">
                    <FaCopy />
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="preview" className="space-y-4">
            {activeTab === "preview" && embedCode && (
              <div className="preview-container">
                <FormPreviewTab id={id} />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { GenerateCodeBtn };
export default GenerateCodeBtn;
