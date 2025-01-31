"use server";

import prisma from "@/lib/prisma";
import { formSchema, formSchemaType } from "@/schemas/form";
import { currentUser } from "@clerk/nextjs";
import { PageConfig } from "@/context/DesignerContext";
import { z } from "zod";
import { Form } from "@prisma/client";

export type FullForm = Form & {
  pages: Page[];
};

export type Page = {
  elements: string;
  config: string;
  order: number;
};

const pageSchema = z.object({
  elements: z.string(),
  config: z.string(),
  order: z.number(),
});

const updateFormSchema = z.object({
  id: z.number(),
  content: z.string(),
  isMultiPage: z.boolean(),
  pages: z.array(pageSchema),
});

export type UpdateFormInput = z.infer<typeof updateFormSchema>;

class UserNotFoundErr extends Error {}

export async function GetFormStats() {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  const stats = await prisma.form.aggregate({
    where: {
      userId: user.id,
    },
    _sum: {
      visits: true,
      submissions: true,
    },
  });

  const visits = stats._sum.visits || 0;
  const submissions = stats._sum.submissions || 0;

  let submissionRate = 0;

  if (visits > 0) {
    submissionRate = (submissions / visits) * 100;
  }

  const bounceRate = 100 - submissionRate;

  return {
    visits,
    submissions,
    submissionRate,
    bounceRate,
  };
}

export async function CreateForm(data: formSchemaType) {
  const validation = formSchema.safeParse(data);
  if (!validation.success) {
    throw new Error("form not valid");
  }

  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  const { name, description, theme } = data;

  // Check for existing forms with the same name
  const existingForms = await prisma.form.findMany({
    where: {
      userId: user.id,
      name: {
        startsWith: name,
      },
    },
    select: {
      name: true,
    },
  });

  // If there are existing forms with the same name, append a number
  let newName = name;
  if (existingForms.length > 0) {
    const existingNames = new Set(existingForms.map(f => f.name));
    let counter = 1;
    while (existingNames.has(newName)) {
      newName = `${name} (${counter})`;
      counter++;
    }
  }

  const form = await prisma.form.create({
    data: {
      userId: user.id,
      name: newName,
      description,
      theme: theme || "default",
    },
  });

  if (!form) {
    throw new Error("something went wrong");
  }

  return form.id;
}

export async function DeleteForm(formId: number) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  // Check if the form exists and belongs to the user
  const existingForm = await prisma.form.findFirst({
    where: {
      id: formId,
      userId: user.id,
    },
  });

  if (!existingForm) {
    throw new Error("Form not found or you don't have permission to delete it");
  }

  // Delete related submissions first
  await prisma.formSubmissions.deleteMany({
    where: {
      formId: formId,
    },
  });

  // Delete the form
  await prisma.form.delete({
    where: {
      id: formId,
    },
  });

  return true;
}

export async function GetForms() {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function GetFormById(id: number): Promise<FullForm | null> {
  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      pages: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  });

  if (!form) return null;

  return form;
}

export async function UpdateFormContent(input: UpdateFormInput) {
  console.log('Received form data:', input); // Debug log
  
  const validation = updateFormSchema.safeParse(input);
  if (!validation.success) {
    console.error('Validation error:', validation.error); // Debug log
    throw new Error('Invalid form data');
  }

  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  const { id, content, isMultiPage, pages } = input;

  try {
    const form = await prisma.form.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        content,
        isMultiPage,
        pages: {
          deleteMany: {},
          create: pages,
        },
      },
      include: {
        pages: true
      }
    });

    console.log('Updated form:', form); // Debug log
    return form;
  } catch (error) {
    console.error('Database error:', error); // Debug log
    throw error;
  }
}

export async function PublishForm(id: number) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  // First check if the form exists and belongs to the user
  const form = await prisma.form.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!form) {
    throw new Error("Form not found");
  }

  return await prisma.form.update({
    where: {
      id,
    },
    data: {
      published: true,
    },
  });
}

export async function GetFormContentByUrl(formUrl: string) {
  return await prisma.form.update({
    select: {
      content: true,
      theme: true,
    },
    data: {
      visits: {
        increment: 1,
      },
    },
    where: {
      shareURL: formUrl,
    },
  });
}

export async function SubmitForm(formUrl: string, content: string) {
  return await prisma.form.update({
    data: {
      submissions: {
        increment: 1,
      },
      FormSubmissions: {
        create: {
          content,
        },
      },
    },
    where: {
      shareURL: formUrl,
      published: true,
    },
  });
}

export async function GetFormWithSubmissions(id: number) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.findUnique({
    where: {
      userId: user.id,
      id,
    },
    include: {
      FormSubmissions: true,
    },
  });
}
