"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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
    if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
      throw new Error("Unsupported image type");
    }
    if (image.size > MAX_IMAGE_BYTES) {
      throw new Error("Image too large (max 5MB)");
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext = image.type.split("/")[1];
    const filename = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await image.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);
    imageUrl = `/uploads/${filename}`;
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
