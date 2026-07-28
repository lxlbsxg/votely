"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/upload";

export async function createContent(formData: FormData) {
  const session = await auth();
  if (!session) {
    throw new Error("Must be signed in to publish");
  }

  const body = (formData.get("body") as string | null)?.trim();
  if (!body) {
    throw new Error("Content body is required");
  }

  const isPublic = formData.get("isPublic") === "on";
  const isAnonymous = formData.get("isAnonymous") === "on";

  let imageUrl: string | null = null;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    imageUrl = await saveUploadedImage(image);
  }

  await prisma.content.create({
    data: {
      authorId: session.user.id,
      body,
      imageUrl,
      isPublic,
      isAnonymous,
    },
  });

  redirect("/");
}
