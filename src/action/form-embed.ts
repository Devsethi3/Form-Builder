"use server";

import { currentUser } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

class UserNotFoundErr extends Error {}

export type EmbedCodeResponse = {
  scriptUrl: string;
  embedCode: string;
  formId: number;
};

export async function GenerateEmbedCode(formId: number): Promise<EmbedCodeResponse> {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  // Verify the form exists and belongs to the user
  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      userId: user.id,
    },
  });

  if (!form) {
    throw new Error("Form not found");
  }

  // Generate unique script URL for this form
  const scriptUrl = `/api/embed/${formId}/js`;

  // Generate the embed code with a container div and the script
  const embedCode = `
<!-- Quick Form Builder Embed -->
<div id="quick-form-${formId}"></div>
<script src="${scriptUrl}" async defer></script>
  `.trim();

  return {
    scriptUrl,
    embedCode,
    formId,
  };
}
