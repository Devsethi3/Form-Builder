"use client";

import { useEffect } from "react";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { useDesigner } from "@/context/DesignerContext";
import { formThemes } from "@/schemas/form";
import { toast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { BiPlus } from "react-icons/bi";
import { Separator } from "./ui/separator";

function FormSettings() {
  const { 
    isMultiPage, 
    setIsMultiPage, 
    theme, 
    setTheme, 
    setPages,
    pages,
    currentPage,
    setCurrentPage 
  } = useDesigner();

  const handleMultiPageChange = async (checked: boolean) => {
    try {
      console.log('Toggle clicked, changing to:', checked);
      
      if (checked) {
        console.log('Initializing first page');
        await setPages([{
          elements: [],
          config: {
            navigationType: 'tabs',
            showPageNumbers: true
          }
        }]);
        await setCurrentPage(0);
      }

      setIsMultiPage(checked);
      toast({
        title: checked ? "Multi-page mode enabled" : "Single-page mode enabled",
        description: checked ? "Your form now supports multiple pages" : "Your form is now single-page",
      });
    } catch (error) {
      console.error('Error changing multi-page mode:', error);
      toast({
        title: "Error",
        description: "Failed to change form mode",
        variant: "destructive",
      });
    }
  };

  const handleAddPage = () => {
    setPages([...pages, {
      elements: [],
      config: {
        navigationType: pages[0]?.config.navigationType || 'tabs',
        showPageNumbers: pages[0]?.config.showPageNumbers || true
      }
    }]);
    toast({
      title: "New page added",
      description: `Page ${pages.length + 1} has been added to your form`,
    });
  };

  const handleNavigationTypeChange = (type: 'tabs' | 'progress-bar') => {
    setPages(pages.map(page => ({
      ...page,
      config: {
        ...page.config,
        navigationType: type
      }
    })));
    toast({
      title: "Navigation style updated",
      description: `Form navigation changed to ${type}`,
    });
  };

  const handleShowPageNumbersChange = (checked: boolean) => {
    setPages(pages.map(page => ({
      ...page,
      config: {
        ...page.config,
        showPageNumbers: checked
      }
    })));
    toast({
      title: checked ? "Page numbers enabled" : "Page numbers disabled",
      description: checked ? "Page numbers will be shown in the form" : "Page numbers will be hidden",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="multi-page" className="text-sm">Multi-page form</Label>
        <Switch
          id="multi-page"
          checked={isMultiPage}
          onCheckedChange={handleMultiPageChange}
        />
      </div>

      {isMultiPage && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Label className="text-sm">Navigation style</Label>
              <Select 
                value={pages[0]?.config.navigationType} 
                onValueChange={(value: 'tabs' | 'progress-bar') => handleNavigationTypeChange(value)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tabs">Tabs</SelectItem>
                  <SelectItem value="progress-bar">Progress Bar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="show-numbers" className="text-sm">Show page numbers</Label>
              <Switch
                id="show-numbers"
                checked={pages[0]?.config.showPageNumbers}
                onCheckedChange={handleShowPageNumbersChange}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label className="text-sm">Pages ({pages.length})</Label>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={handleAddPage}
              >
                <BiPlus className="h-4 w-4" />
                Add Page
              </Button>
            </div>
          </div>
        </>
      )}

      <Separator />
      <div className="space-y-2">
        <Label className="text-sm">Theme</Label>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(formThemes).map((themeKey) => (
              <SelectItem key={themeKey} value={themeKey}>
                {themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default FormSettings;
