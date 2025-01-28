import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const formId = parseInt(params.formId);
    const data = await request.json();

    // Get the form to verify it exists and is published
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        published: true,
      },
    });

    if (!form) {
      return new NextResponse("Form not found", { status: 404 });
    }

    // Save the submission
    const submission = await prisma.formSubmissions.create({
      data: {
        formId,
        content: JSON.stringify(data),
      },
    });

    // Update form submission count
    await prisma.form.update({
      where: { id: formId },
      data: { submissions: { increment: 1 } },
    });

    return new NextResponse(JSON.stringify({
      data: submission,
      message: "Form submitted successfully",
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
      },
    });
  } catch (error) {
    console.error('Error processing form submission:', error);
    return new NextResponse("Error processing submission", { status: 500 });
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
