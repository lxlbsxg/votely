"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VoteType } from "@/generated/prisma/client";

export async function castVote(contentId: string, type: VoteType) {
  const session = await auth();
  if (!session) {
    throw new Error("Must be signed in to vote");
  }

  await prisma.vote.upsert({
    where: {
      userId_contentId: {
        userId: session.user.id,
        contentId,
      },
    },
    create: {
      userId: session.user.id,
      contentId,
      type,
    },
    update: {
      type,
    },
  });
}
