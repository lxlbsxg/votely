import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

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
