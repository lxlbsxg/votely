"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type FeedItem = {
  id: string;
  body: string;
  imageUrl: string | null;
  isAnonymous: boolean;
  authorName: string | null;
};

export async function getFeedBatch(
  cursor?: string,
  take = 10,
): Promise<FeedItem[]> {
  const session = await auth();
  if (!session) return [];

  const items = await prisma.content.findMany({
    where: {
      isPublic: true,
      authorId: { not: session.user.id },
      votes: { none: { userId: session.user.id } },
    },
    orderBy: { createdAt: "desc" },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: { author: { select: { name: true, email: true } } },
  });

  return items.map((item) => ({
    id: item.id,
    body: item.body,
    imageUrl: item.imageUrl,
    isAnonymous: item.isAnonymous,
    authorName: item.isAnonymous
      ? null
      : (item.author.name ?? item.author.email),
  }));
}
