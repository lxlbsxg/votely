"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateRVS } from "@/lib/rvs";
import { recomputeUserProfile } from "@/lib/profileScoring";
import { VoteType } from "@/generated/prisma/client";

export async function castVote(
  contentId: string,
  type: VoteType,
  shownAt: number,
  forwardId?: string,
) {
  const session = await auth();
  if (!session) {
    throw new Error("Must be signed in to vote");
  }

  const userId = session.user.id;
  const votedAt = Date.now();
  const latencyMs = Math.max(0, votedAt - shownAt);
  const rvs = calculateRVS(latencyMs);

  const vote = await prisma.vote.upsert({
    where: {
      userId_contentId: { userId, contentId },
    },
    create: { userId, contentId, type, forwardId },
    update: { type, ...(forwardId ? { forwardId } : {}) },
  });

  await prisma.voteEvent.upsert({
    where: { voteId: vote.id },
    create: {
      voteId: vote.id,
      userId,
      contentId,
      shownAt: new Date(shownAt),
      votedAt: new Date(votedAt),
      latencyMs,
      rvs,
    },
    update: {
      shownAt: new Date(shownAt),
      votedAt: new Date(votedAt),
      latencyMs,
      rvs,
    },
  });

  try {
    await recomputeUserProfile(userId);
  } catch (error) {
    console.error("Failed to recompute user profile", error);
  }
}
