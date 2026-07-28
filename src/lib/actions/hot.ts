"use server";

import { prisma } from "@/lib/prisma";

const RECENT_WINDOW_DAYS = 7;

export type HotItem = {
  id: string;
  body: string;
  imageUrl: string | null;
  isAnonymous: boolean;
  authorName: string | null;
  supportCount: number;
  opposeCount: number;
  forwardCount: number;
  score: number;
};

// Ranked by recent (last 7 days) support + oppose + forward volume. Simple
// in-process aggregation - fine at this scale, revisit with a real
// materialized ranking if content volume grows.
export async function getHotContent(take = 20): Promise<HotItem[]> {
  const since = new Date(Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const items = await prisma.content.findMany({
    where: { isPublic: true },
    include: {
      author: { select: { name: true, email: true } },
      votes: {
        where: {
          createdAt: { gte: since },
          type: { in: ["SUPPORT", "OPPOSE"] },
        },
        select: { type: true },
      },
      forwards: {
        where: { createdAt: { gte: since } },
        select: { id: true },
      },
    },
  });

  const scored = items.map((item) => {
    const supportCount = item.votes.filter((v) => v.type === "SUPPORT").length;
    const opposeCount = item.votes.filter((v) => v.type === "OPPOSE").length;
    const forwardCount = item.forwards.length;

    return {
      id: item.id,
      body: item.body,
      imageUrl: item.imageUrl,
      isAnonymous: item.isAnonymous,
      authorName: item.isAnonymous
        ? null
        : (item.author.name ?? item.author.email),
      supportCount,
      opposeCount,
      forwardCount,
      score: supportCount + opposeCount + forwardCount,
    };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, take);
}
