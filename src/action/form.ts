"use server";

import prisma from "@/lib/prisma";
import { formSchema, formSchemaType } from "@/schemas/form";
import { currentUser } from "@clerk/nextjs";

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

  const form = await prisma.form.create({
    data: {
      userId: user.id,
      name,
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

  // Check if the form exists before attempting to delete it
  const existingForm = await prisma.form.findUnique({
    where: {
      id: formId,
    },
  });

  if (!existingForm) {
    throw new Error("Form not found");
  }

  // Check if there are any related records (e.g., submissions) before deleting the form
  const submissions = await prisma.formSubmissions.findMany({
    where: {
      formId: formId,
    },
  });

  // Delete related records first
  await Promise.all(
    submissions.map(async (submission) => {
      await prisma.formSubmissions.delete({
        where: {
          id: submission.id,
        },
      });
    })
  );

  // Now delete the form
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

export async function GetFormById(id: number) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.findUnique({
    where: {
      userId: user.id,
      id,
    },
  });
}

export async function UpdateFormContent(id: number, jsonContent: string, theme?: string) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new UserNotFoundErr();
    }

    return await prisma.form.update({
      where: {
        userId: user.id,
        id,
      },
      data: {
        content: jsonContent,
        ...(theme && { theme }),
      },
    });
  } catch (error) {
    console.error('Error in UpdateFormContent:', error);
    throw error;
  }
}

export async function PublishForm(id: number) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.update({
    data: {
      published: true,
    },
    where: {
      userId: user.id,
      id,
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
