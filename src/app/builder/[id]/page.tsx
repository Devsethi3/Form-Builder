import { GetFormById } from "@/action/form";
import FormBuilder from "@/components/FormBuilder";
import React from "react";

async function BuilderPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const { id } = params;
  const formId = Number(id);
  const form = await GetFormById(formId);
  if (!form) {
    throw new Error("form not found");
  }
  return (
    <>
      <FormBuilder id={formId} />
    </>
  );
}

export default BuilderPage;