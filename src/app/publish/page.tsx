import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createContent } from "@/lib/actions/content";

export default async function PublishPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-semibold">Publish an opinion</h1>

        <form action={createContent} className="mt-6 flex flex-col gap-4">
          <textarea
            name="body"
            required
            rows={5}
            placeholder="What's your take?"
            className="rounded-md border border-black/[.12] bg-white px-4 py-3 text-sm dark:border-white/[.145] dark:bg-black"
          />

          <input
            type="file"
            name="image"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="text-sm"
          />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublic" defaultChecked />
            Public (uncheck to keep private)
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isAnonymous" />
            Post anonymously
          </label>

          <button
            type="submit"
            className="mt-2 rounded-full bg-foreground px-5 py-2 text-sm text-background"
          >
            Publish
          </button>
        </form>
      </div>
    </div>
  );
}
