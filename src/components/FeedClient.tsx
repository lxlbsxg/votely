"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { FeedItem } from "@/lib/actions/feed";
import { castVote } from "@/lib/actions/vote";
import type { VoteType } from "@/generated/prisma/client";

type Props = {
  initialItems: FeedItem[];
  loadMore: (cursor: string) => Promise<FeedItem[]>;
};

export function FeedClient({ initialItems, loadMore }: Props) {
  const [items, setItems] = useState(initialItems);
  const [index, setIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const fetchingRef = useRef(false);

  const current = items[index];
  const remaining = items.length - index;

  useEffect(() => {
    if (remaining > 2 || remaining === 0 || fetchingRef.current) return;

    const lastId = items[items.length - 1]?.id;
    if (!lastId) return;

    fetchingRef.current = true;
    loadMore(lastId).then((more) => {
      if (more.length > 0) {
        setItems((prev) => [...prev, ...more]);
      }
      fetchingRef.current = false;
    });
  }, [remaining, items, loadMore]);

  function vote(type: VoteType) {
    if (!current) return;
    const contentId = current.id;
    setIndex((i) => i + 1);
    startTransition(async () => {
      await castVote(contentId, type);
    });
  }

  if (!current) {
    return (
      <div className="mt-8 rounded-lg border border-dashed border-black/[.12] p-8 text-center text-sm text-zinc-500 dark:border-white/[.145]">
        {isPending
          ? "Loading..."
          : "You're all caught up. No more opinions right now."}
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="rounded-xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-zinc-900">
        <p className="text-xs text-zinc-500">
          {current.isAnonymous ? "Anonymous" : (current.authorName ?? "Someone")}
        </p>
        {current.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.imageUrl}
            alt=""
            className="mt-3 max-h-96 w-full rounded-lg object-cover"
          />
        )}
        <p className="mt-3 whitespace-pre-wrap text-base">{current.body}</p>
      </div>
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
    </div>
  );
}
