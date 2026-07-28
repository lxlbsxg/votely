"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/upload";
import { analyzeContent } from "@/lib/analysis";

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

  const tags = Array.from(
    new Set(
      (formData.get("tags") as string | null)
        ?.split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean) ?? [],
    ),
  );

  let imageUrl: string | null = null;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    imageUrl = await saveUploadedImage(image);
  }

  const assetId = (formData.get("assetId") as string | null)?.trim() || null;
  const asset = assetId
    ? await prisma.asset.findUnique({ where: { id: assetId } })
    : null;

  const content = await prisma.content.create({
    data: {
      authorId: session.user.id,
      body,
      imageUrl,
      isPublic,
      isAnonymous,
      tags,
      assetId: asset?.id ?? null,
    },
  });

  try {
    await analyzeContent(content.id, body);
  } catch (error) {
    console.error("Failed to analyze content", error);
  }

  if (asset) {
    const path =
      asset.type === "STOCK"
        ? `/assets/stock/${asset.providerId}`
        : `/assets/crypto/${asset.providerId}`;
    redirect(path);
  }
  redirect("/");
}
