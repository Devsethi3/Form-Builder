"use client";

import { FormElementInstance } from "@/components/FormElements";
import { formThemes } from "@/schemas/form";
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState, useCallback } from "react";

export interface PageConfig {
  elements: FormElementInstance[];
  config: {
    navigationType: 'tabs' | 'progress-bar';
    showPageNumbers: boolean;
  };
}

type DesignerContextType = {
  elements: FormElementInstance[];
  setElements: Dispatch<SetStateAction<FormElementInstance[]>>;
  addElement: (index: number, element: FormElementInstance) => void;
  removeElement: (id: string) => void;
  selectedElement: FormElementInstance | null;
  setSelectedElement: Dispatch<SetStateAction<FormElementInstance | null>>;
  updateElement: (id: string, element: FormElementInstance) => void;
  theme: keyof typeof formThemes;
  setTheme: Dispatch<SetStateAction<keyof typeof formThemes>>;
  isMultiPage: boolean;
  setIsMultiPage: (value: boolean) => void;
  pages: PageConfig[];
  setPages: (pages: PageConfig[]) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
};

export const DesignerContext = createContext<DesignerContextType | null>(null);

export function useDesigner() {
  const context = useContext(DesignerContext);
  
  if (!context) {
    throw new Error("useDesigner must be used within a DesignerContextProvider");
  }

  return context;
}

export function DesignerContextProvider({ children }: { children: ReactNode }) {
  const [elements, setElements] = useState<FormElementInstance[]>([]);
  const [selectedElement, setSelectedElement] = useState<FormElementInstance | null>(null);
  const [theme, setTheme] = useState<keyof typeof formThemes>("default");
  const [isMultiPage, setIsMultiPage] = useState(false);
  const [pages, setPages] = useState<PageConfig[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  // Debug logs for state changes
  const handleSetIsMultiPage = useCallback((value: boolean) => {
    console.log('Setting isMultiPage in context to:', value);
    setIsMultiPage(value);
  }, []);

  const handleSetPages = useCallback((newPages: PageConfig[]) => {
    console.log('Setting pages in context to:', newPages);
    setPages(newPages);
  }, []);

  const handleSetCurrentPage = useCallback((page: number) => {
    console.log('Setting current page in context to:', page);
    setCurrentPage(page);
  }, []);

  const addElement = (index: number, element: FormElementInstance) => {
    if (isMultiPage) {
      setPages(prev => {
        const newPages = [...prev];
        if (!newPages[currentPage]) {
          newPages[currentPage] = {
            elements: [],
            config: {
              navigationType: 'tabs',
              showPageNumbers: true
            }
          };
        }
        const elements = [...newPages[currentPage].elements];
        elements.splice(index, 0, element);
        newPages[currentPage] = {
          ...newPages[currentPage],
          elements
        };
        return newPages;
      });
    } else {
      setElements(prev => {
        const newElements = [...prev];
        newElements.splice(index, 0, element);
        return newElements;
      });
    }
  };

  const removeElement = (id: string) => {
    if (isMultiPage) {
      setPages(prev => {
        const newPages = [...prev];
        if (newPages[currentPage]) {
          newPages[currentPage] = {
            ...newPages[currentPage],
            elements: newPages[currentPage].elements.filter(element => element.id !== id)
          };
        }
        return newPages;
      });
    } else {
      setElements(prev => prev.filter(element => element.id !== id));
    }
  };

  const updateElement = (id: string, element: FormElementInstance) => {
    if (isMultiPage) {
      setPages(prev => {
        const newPages = [...prev];
        if (newPages[currentPage]) {
          const elements = [...newPages[currentPage].elements];
          const index = elements.findIndex(el => el.id === id);
          if (index !== -1) {
            elements[index] = element;
            newPages[currentPage] = {
              ...newPages[currentPage],
              elements
            };
          }
        }
        return newPages;
      });
    } else {
      setElements(prev => {
        const newElements = [...prev];
        const index = newElements.findIndex(el => el.id === id);
        newElements[index] = element;
        return newElements;
      });
    }
  };

  return (
    <DesignerContext.Provider
      value={{
        elements,
        setElements,
        addElement,
        removeElement,
        selectedElement,
        setSelectedElement,
        updateElement,
        theme,
        setTheme,
        isMultiPage,
        setIsMultiPage: handleSetIsMultiPage,
        pages,
        setPages: handleSetPages,
        currentPage,
        setCurrentPage: handleSetCurrentPage,
      }}
    >
      {children}
    </DesignerContext.Provider>
  );
}
