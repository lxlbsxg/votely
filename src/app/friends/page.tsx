import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listOtherUsers, listFriends, addFriend } from "@/lib/actions/friends";
import { openDirectChat } from "@/lib/actions/chat";

function displayName(u: {
  name: string | null;
  email: string | null;
  isAnonymous: boolean;
}) {
  if (u.isAnonymous) return "Guest user";
  return u.name ?? u.email ?? "User";
}

export default async function FriendsPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const [others, friends] = await Promise.all([listOtherUsers(), listFriends()]);
  const friendIds = new Set(friends.map((f) => f.id));

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-semibold">Friends</h1>

        <section className="mt-6">
          <h2 className="text-sm font-medium text-zinc-500">Your friends</h2>
          {friends.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">No friends yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-black/[.08] dark:divide-white/[.145]">
              {friends.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span>{displayName(f)}</span>
                  <form action={openDirectChat.bind(null, f.id)}>
                    <button
                      type="submit"
                      className="text-xs text-zinc-500 hover:underline"
                    >
                      Message
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-medium text-zinc-500">All users</h2>
          <ul className="mt-2 divide-y divide-black/[.08] dark:divide-white/[.145]">
            {others.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span>{displayName(u)}</span>
                {friendIds.has(u.id) ? (
                  <span className="text-xs text-zinc-400">Friends</span>
                ) : (
                  <form action={addFriend.bind(null, u.id)}>
                    <button
                      type="submit"
                      className="text-xs text-zinc-500 hover:underline"
                    >
                      Add friend
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
