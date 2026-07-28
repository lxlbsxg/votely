"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const userSummarySelect = {
  id: true,
  name: true,
  email: true,
  isAnonymous: true,
} as const;

export async function listOtherUsers() {
  const session = await auth();
  if (!session) return [];

  return prisma.user.findMany({
    where: { id: { not: session.user.id } },
    select: userSummarySelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function listFriends() {
  const session = await auth();
  if (!session) return [];

  const friendships = await prisma.friendship.findMany({
    where: { userId: session.user.id },
    include: { friend: { select: userSummarySelect } },
  });

  return friendships.map((f) => f.friend);
}

export async function addFriend(friendId: string) {
  const session = await auth();
  if (!session) throw new Error("Must be signed in");

  const userId = session.user.id;
  if (userId === friendId) throw new Error("Cannot friend yourself");

  await prisma.$transaction([
    prisma.friendship.upsert({
      where: { userId_friendId: { userId, friendId } },
      create: { userId, friendId },
      update: {},
    }),
    prisma.friendship.upsert({
      where: { userId_friendId: { userId: friendId, friendId: userId } },
      create: { userId: friendId, friendId: userId },
      update: {},
    }),
  ]);

  revalidatePath("/friends");
}
