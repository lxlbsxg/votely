"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function listMyGroups() {
  const session = await auth();
  if (!session) return [];

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: { group: { include: { conversation: true } } },
  });

  return memberships.map((m) => m.group);
}

export async function createGroup(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Must be signed in");

  const name = (formData.get("name") as string | null)?.trim();
  if (!name) throw new Error("Group name is required");

  const memberIds = formData.getAll("memberIds").map(String);
  const uniqueMemberIds = Array.from(new Set([session.user.id, ...memberIds]));

  await prisma.group.create({
    data: {
      name,
      ownerId: session.user.id,
      members: {
        create: uniqueMemberIds.map((userId) => ({ userId })),
      },
      conversation: {
        create: {
          isGroup: true,
          members: {
            create: uniqueMemberIds.map((userId) => ({ userId })),
          },
        },
      },
    },
  });

  revalidatePath("/groups");
  redirect("/groups");
}
