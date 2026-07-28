"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateDirectConversation } from "@/lib/actions/chat";

const userSummarySelect = {
  id: true,
  name: true,
  email: true,
  isAnonymous: true,
} as const;

export type ForwardTarget =
  | { type: "user"; id: string }
  | { type: "group"; id: string };

export async function getForwardTargets() {
  const session = await auth();
  if (!session) return { friends: [], groups: [] };
  const userId = session.user.id;

  const [friendships, memberships] = await Promise.all([
    prisma.friendship.findMany({
      where: { userId },
      include: { friend: { select: userSummarySelect } },
    }),
    prisma.groupMember.findMany({
      where: { userId },
      include: { group: { select: { id: true, name: true } } },
    }),
  ]);

  return {
    friends: friendships.map((f) => f.friend),
    groups: memberships.map((m) => m.group),
  };
}

export async function createForward(contentId: string, target: ForwardTarget) {
  const session = await auth();
  if (!session) throw new Error("Must be signed in");
  const fromUserId = session.user.id;

  let conversationId: string;
  if (target.type === "user") {
    conversationId = await getOrCreateDirectConversation(target.id);
  } else {
    const conversation = await prisma.conversation.findUnique({
      where: { groupId: target.id },
      select: { id: true },
    });
    if (!conversation) throw new Error("Group conversation not found");
    conversationId = conversation.id;
  }

  const forward = await prisma.forward.create({
    data: {
      contentId,
      fromUserId,
      toUserId: target.type === "user" ? target.id : null,
      toGroupId: target.type === "group" ? target.id : null,
    },
  });

  await prisma.message.create({
    data: {
      conversationId,
      senderId: fromUserId,
      type: "FORWARD",
      forwardId: forward.id,
    },
  });

  revalidatePath("/chat");
}
