import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listOtherUsers } from "@/lib/actions/friends";
import { createGroup, listMyGroups } from "@/lib/actions/groups";

function displayName(u: {
  name: string | null;
  email: string | null;
  isAnonymous: boolean;
}) {
  if (u.isAnonymous) return "Guest user";
  return u.name ?? u.email ?? "User";
}

export default async function GroupsPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const [others, groups] = await Promise.all([
    listOtherUsers(),
    listMyGroups(),
  ]);

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-semibold">Groups</h1>

        <section className="mt-6">
          <h2 className="text-sm font-medium text-zinc-500">Your groups</h2>
          {groups.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">
              You&apos;re not in any groups yet.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-black/[.08] dark:divide-white/[.145]">
              {groups.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span>{g.name}</span>
                  {g.conversation && (
                    <Link
                      href={`/chat/${g.conversation.id}`}
                      className="text-xs text-zinc-500 hover:underline"
                    >
                      Open chat
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-medium text-zinc-500">Create a group</h2>
          <form action={createGroup} className="mt-3 flex flex-col gap-3">
            <input
              type="text"
              name="name"
              required
              placeholder="Group name"
              className="rounded-md border border-black/[.12] bg-white px-4 py-2 text-sm dark:border-white/[.145] dark:bg-black"
            />
            <div className="max-h-48 overflow-y-auto rounded-md border border-black/[.12] p-3 dark:border-white/[.145]">
              {others.length === 0 ? (
                <p className="text-sm text-zinc-500">No other users yet.</p>
              ) : (
                others.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-2 py-1 text-sm"
                  >
                    <input type="checkbox" name="memberIds" value={u.id} />
                    {displayName(u)}
                  </label>
                ))
              )}
            </div>
            <button
              type="submit"
              className="rounded-full bg-foreground px-5 py-2 text-sm text-background"
            >
              Create group
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
