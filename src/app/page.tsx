import Link from "next/link";
import { auth } from "@/lib/auth";
import { getFeedBatch } from "@/lib/actions/feed";
import { FeedClient } from "@/components/FeedClient";

export default async function FeedPage() {
  const session = await auth();

  if (!session) {
    return (
      <div className="flex flex-1 flex-col items-center px-6 py-16">
        <div className="w-full max-w-xl text-center">
          <h1 className="text-2xl font-semibold">Feed</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Sign in to start voting on opinions.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-full bg-foreground px-5 py-2 text-sm text-background"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const initialItems = await getFeedBatch(undefined, 10);

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-semibold">Feed</h1>
        <FeedClient initialItems={initialItems} loadMore={getFeedBatch} />
      </div>
    </div>
  );
}
