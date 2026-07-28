"use client";

import { useState, useTransition } from "react";
import { getForwardTargets, createForward } from "@/lib/actions/forward";

type FriendOption = {
  id: string;
  name: string | null;
  email: string | null;
  isAnonymous: boolean;
};
type GroupOption = { id: string; name: string };

function friendLabel(f: FriendOption) {
  return f.isAnonymous ? "Guest user" : (f.name ?? f.email ?? "User");
}

export function ForwardButton({ contentId }: { contentId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<FriendOption[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function openModal() {
    setOpen(true);
    setSentTo(null);
    setLoading(true);
    const { friends, groups } = await getForwardTargets();
    setFriends(friends);
    setGroups(groups);
    setLoading(false);
  }

  function forwardTo(target: { type: "user" | "group"; id: string }, label: string) {
    startTransition(async () => {
      await createForward(contentId, target);
      setSentTo(label);
      setTimeout(() => setOpen(false), 900);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="text-xs text-zinc-500 hover:underline"
      >
        Forward
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-5 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-medium">Forward to...</h2>

            {sentTo ? (
              <p className="mt-4 text-sm text-green-600">Forwarded to {sentTo}.</p>
            ) : loading ? (
              <p className="mt-4 text-sm text-zinc-500">Loading...</p>
            ) : friends.length === 0 && groups.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">
                No friends or groups yet. Add friends on the Friends page first.
              </p>
            ) : (
              <div className="mt-4 max-h-72 space-y-4 overflow-y-auto">
                {friends.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-zinc-500">Friends</h3>
                    <ul className="mt-2 space-y-1">
                      {friends.map((f) => (
                        <li key={f.id}>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              forwardTo({ type: "user", id: f.id }, friendLabel(f))
                            }
                            className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/[.04] dark:hover:bg-white/[.08]"
                          >
                            {friendLabel(f)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {groups.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-zinc-500">Groups</h3>
                    <ul className="mt-2 space-y-1">
                      {groups.map((g) => (
                        <li key={g.id}>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => forwardTo({ type: "group", id: g.id }, g.name)}
                            className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/[.04] dark:hover:bg-white/[.08]"
                          >
                            {g.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 text-xs text-zinc-500 hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
