import { auth } from "@/lib/auth";

export default async function FeedPage() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-semibold">Feed</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {session
            ? `Welcome back${session.user.isAnonymous ? ", guest" : ""}.`
            : "Sign in to start posting opinions."}
        </p>
        <div className="mt-8 rounded-lg border border-dashed border-black/[.12] p-8 text-center text-sm text-zinc-500 dark:border-white/[.145]">
          No opinions yet. Posting comes in a later phase.
        </div>
      </div>
    </div>
  );
}
