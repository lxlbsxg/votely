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

const POOL_SIZE = 200;
const SIMILAR_RATIO = 0.6;
const OPPOSITE_RATIO = 0.3;
// remaining ~0.1 is the random/exploration bucket

type PoolItem = Awaited<ReturnType<typeof getEligiblePool>>[number];

async function getEligiblePool(userId: string, excludeIds: string[]) {
  return prisma.content.findMany({
    where: {
      isPublic: true,
      authorId: { not: userId },
      votes: { none: { userId } },
      ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: POOL_SIZE,
    include: {
      author: { select: { name: true, email: true } },
      votes: { select: { type: true } },
    },
  });
}

function toFeedItem(item: PoolItem): FeedItem {
  return {
    id: item.id,
    body: item.body,
    imageUrl: item.imageUrl,
    isAnonymous: item.isAnonymous,
    authorName: item.isAnonymous
      ? null
      : (item.author.name ?? item.author.email),
  };
}

// Aggregate community stance on a piece of content from its votes so far,
// -1 (all oppose) .. 1 (all support), 0 if unvoted or all skips.
function contentStance(votes: { type: string }[]): number {
  const scored = votes.filter((v) => v.type !== "SKIP");
  if (scored.length === 0) return 0;
  const sum = scored.reduce(
    (total, v) => total + (v.type === "SUPPORT" ? 1 : -1),
    0,
  );
  return sum / scored.length;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Simple tag + aggregate-stance recommendation, no vector DB:
 * - "similar" (60%): tag overlaps the user's interestTags and the
 *   content's current community stance doesn't contradict the user's
 *   own stanceBias.
 * - "opposite" (30%): the content's community stance leans the opposite
 *   direction from the user's stanceBias, to create discussion tension.
 * - "random" (~10%): everything else, an exploration pool.
 * New users with no profile signal yet get plain reverse-chronological
 * (same as Phase 1) rather than an arbitrary bucket split.
 */
export async function getFeedBatch(
  excludeIds: string[] = [],
  take = 10,
): Promise<FeedItem[]> {
  const session = await auth();
  if (!session) return [];
  const userId = session.user.id;

  const [profile, pool] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    getEligiblePool(userId, excludeIds),
  ]);

  if (pool.length === 0) return [];

  const interestTags = profile?.interestTags ?? [];
  const stanceBias = profile?.stanceBias ?? 0;
  const hasSignal = interestTags.length > 0 || stanceBias !== 0;

  if (!hasSignal) {
    return pool.slice(0, take).map(toFeedItem);
  }

  const similar: PoolItem[] = [];
  const opposite: PoolItem[] = [];
  const rest: PoolItem[] = [];

  for (const item of pool) {
    const stance = contentStance(item.votes);
    const overlapsInterest = item.tags.some((tag) =>
      interestTags.includes(tag),
    );
    const stanceSign = Math.sign(stance);
    const biasSign = Math.sign(stanceBias);

    if (
      overlapsInterest &&
      (biasSign === 0 || stanceSign === 0 || stanceSign === biasSign)
    ) {
      similar.push(item);
    } else if (biasSign !== 0 && stanceSign !== 0 && stanceSign === -biasSign) {
      opposite.push(item);
    } else {
      rest.push(item);
    }
  }

  const similarCount = Math.round(take * SIMILAR_RATIO);
  const oppositeCount = Math.round(take * OPPOSITE_RATIO);
  const randomCount = Math.max(0, take - similarCount - oppositeCount);

  const picked: PoolItem[] = [
    ...shuffle(similar).slice(0, similarCount),
    ...shuffle(opposite).slice(0, oppositeCount),
    ...shuffle(rest).slice(0, randomCount),
  ];

  // A bucket may come up short (e.g. little vote history yet) - backfill
  // from whatever's left so batches aren't sparse.
  if (picked.length < take) {
    const pickedIds = new Set(picked.map((p) => p.id));
    const leftover = shuffle(pool.filter((p) => !pickedIds.has(p.id)));
    picked.push(...leftover.slice(0, take - picked.length));
  }

  return shuffle(picked)
    .slice(0, take)
    .map(toFeedItem);
}
