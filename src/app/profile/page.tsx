import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deriveProfileTags } from "@/lib/profileScoring";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });
  const tags = profile ? deriveProfileTags(profile) : [];

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between border-b border-black/[.08] py-2 dark:border-white/[.145]">
            <dt className="text-zinc-500">User ID</dt>
            <dd>{session.user.id}</dd>
          </div>
          <div className="flex justify-between border-b border-black/[.08] py-2 dark:border-white/[.145]">
            <dt className="text-zinc-500">Email</dt>
            <dd>{session.user.email ?? "—"}</dd>
          </div>
          <div className="flex justify-between border-b border-black/[.08] py-2 dark:border-white/[.145]">
            <dt className="text-zinc-500">Account type</dt>
            <dd>{session.user.isAnonymous ? "Guest" : "Registered"}</dd>
          </div>
        </dl>

        <div className="mt-8 rounded-xl border border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-500">EmoScore</h2>
          {profile ? (
            <>
              <p className="mt-1 text-3xl font-semibold">
                {Math.round(profile.emoScore * 100)}
                <span className="text-base font-normal text-zinc-500">
                  {" "}
                  / 100
                </span>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-black/[.06] px-3 py-1 text-xs dark:bg-white/[.1]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">
              Vote on some opinions in the Feed to build your profile.
            </p>
          )}
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
          className="mt-8"
        >
          <button
            type="submit"
            className="rounded-full border border-black/[.12] px-5 py-2 text-sm hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
