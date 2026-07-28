import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ForwardVoteCard } from "@/components/ForwardVoteCard";

type Props = {
  params: Promise<{ forwardId: string }>;
};

export default async function ForwardPage({ params }: Props) {
  const { forwardId } = await params;
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const forward = await prisma.forward.findUnique({
    where: { id: forwardId },
    include: { content: true },
  });
  if (!forward) notFound();

  const userId = session.user.id;
  let allowed = forward.toUserId === userId;
  if (!allowed && forward.toGroupId) {
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: forward.toGroupId, userId } },
    });
    allowed = !!membership;
  }
  if (!allowed) notFound();

  const existingVote = await prisma.vote.findUnique({
    where: { userId_contentId: { userId, contentId: forward.contentId } },
  });

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-semibold">Forwarded opinion</h1>
        <ForwardVoteCard
          content={{
            id: forward.content.id,
            body: forward.content.body,
            imageUrl: forward.content.imageUrl,
            isAnonymous: forward.content.isAnonymous,
          }}
          forwardId={forward.id}
          alreadyVoted={!!existingVote}
        />
      </div>
    </div>
  );
}
