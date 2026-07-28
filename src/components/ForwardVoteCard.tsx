"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { castVote } from "@/lib/actions/vote";
import type { VoteType } from "@/generated/prisma/client";

type Props = {
  content: {
    id: string;
    body: string;
    imageUrl: string | null;
    isAnonymous: boolean;
  };
  forwardId: string;
  alreadyVoted: boolean;
};

export function ForwardVoteCard({ content, forwardId, alreadyVoted }: Props) {
  const [voted, setVoted] = useState(alreadyVoted);
  const [isPending, startTransition] = useTransition();
  const shownAtRef = useRef(0);

  useEffect(() => {
    shownAtRef.current = Date.now();
  }, []);

  function vote(type: VoteType) {
    const shownAt = shownAtRef.current;
    setVoted(true);
    startTransition(async () => {
      await castVote(content.id, type, shownAt, forwardId);
    });
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="rounded-xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-zinc-900">
        <p className="text-xs text-zinc-500">
          {content.isAnonymous ? "Anonymous" : "Someone"}
        </p>
        {content.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.imageUrl}
            alt=""
            className="mt-3 max-h-96 w-full rounded-lg object-cover"
          />
        )}
        <p className="mt-3 whitespace-pre-wrap text-base">{content.body}</p>
      </div>

      {voted ? (
        <p className="text-sm text-zinc-500">
          {isPending ? "Saving your vote..." : "Thanks for voting."}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => vote("SUPPORT")}
            className="rounded-full bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700"
          >
            支持
          </button>
          <button
            onClick={() => vote("OPPOSE")}
            className="rounded-full bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700"
          >
            反对
          </button>
          <button
            onClick={() => vote("SKIP")}
            className="rounded-full border border-black/[.12] px-4 py-3 text-sm font-medium hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            划走
          </button>
        </div>
      )}
    </div>
  );
}
