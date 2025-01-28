import { GetFormContentByUrl } from "@/action/form";
import { FormElementInstance } from "@/components/FormElements";
import FormSubmitComponent from "@/components/FormSubmitComponent";
import { FormTheme } from "@/schemas/form";
import React from "react";

async function SubmitPage({
    params,
}: {
    params: {
        formUrl: string;
    };
}) {
    const form = await GetFormContentByUrl(params.formUrl);

    if (!form) {
        throw new Error("form not found");
    }

    const formContent = JSON.parse(form.content) as FormElementInstance[];
    const theme = (form.theme || "default") as FormTheme;

    return <FormSubmitComponent formUrl={params.formUrl} content={formContent} theme={theme} />;
}

export default SubmitPage;
