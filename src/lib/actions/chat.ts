"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/upload";

const userSummarySelect = {
  id: true,
  name: true,
  email: true,
  isAnonymous: true,
} as const;

export async function getOrCreateDirectConversation(
  otherUserId: string,
): Promise<string> {
  const session = await auth();
  if (!session) throw new Error("Must be signed in");
  const userId = session.user.id;

  const existing = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      members: { some: { userId } },
      AND: { members: { some: { userId: otherUserId } } },
    },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.conversation.create({
    data: {
      isGroup: false,
      members: {
        create: [{ userId }, { userId: otherUserId }],
      },
    },
  });
  return created.id;
}

export async function openDirectChat(otherUserId: string) {
  const conversationId = await getOrCreateDirectConversation(otherUserId);
  redirect(`/chat/${conversationId}`);
}

export async function listConversations() {
  const session = await auth();
  if (!session) return [];
  const userId = session.user.id;

  const memberships = await prisma.conversationMember.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          group: true,
          members: { include: { user: { select: userSummarySelect } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
  });

  return memberships
    .map((m) => m.conversation)
    .sort((a, b) => {
      const aTime = (a.messages[0]?.createdAt ?? a.createdAt).getTime();
      const bTime = (b.messages[0]?.createdAt ?? b.createdAt).getTime();
      return bTime - aTime;
    });
}

export async function getConversation(conversationId: string) {
  const session = await auth();
  if (!session) return null;

  const membership = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId: session.user.id } },
  });
  if (!membership) return null;

  return prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      group: true,
      members: { include: { user: { select: userSummarySelect } } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: userSummarySelect },
          forward: { include: { content: true } },
        },
      },
    },
  });
}

export async function sendMessage(conversationId: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Must be signed in");

  const membership = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: session.user.id },
    },
  });
  if (!membership) throw new Error("Not a participant in this conversation");

  const text = (formData.get("text") as string | null)?.trim();
  const image = formData.get("image");

  let imageUrl: string | null = null;
  if (image instanceof File && image.size > 0) {
    imageUrl = await saveUploadedImage(image);
  }

  if (!text && !imageUrl) {
    throw new Error("Message must have text or an image");
  }

  await prisma.message.create({
    data: {
      conversationId,
      senderId: session.user.id,
      type: imageUrl ? "IMAGE" : "TEXT",
      text: text || null,
      imageUrl,
    },
  });

  revalidatePath(`/chat/${conversationId}`);
}
