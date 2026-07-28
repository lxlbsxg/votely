import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getHotContent } from "@/lib/actions/hot";

export default async function HotPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const items = await getHotContent();

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-semibold">热榜 Hot</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Ranked by support + oppose + forwards over the last 7 days.
        </p>

        {items.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">Nothing trending yet.</p>
        ) : (
          <ol className="mt-6 space-y-4">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="rounded-xl border border-black/[.08] bg-white p-5 dark:border-white/[.145] dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>
                    #{index + 1} ·{" "}
                    {item.isAnonymous ? "Anonymous" : (item.authorName ?? "Someone")}
                  </span>
                  <span>{item.score} interactions</span>
                </div>
                {item.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="mt-3 max-h-72 w-full rounded-lg object-cover"
                  />
                )}
                <p className="mt-2 whitespace-pre-wrap text-sm">{item.body}</p>
                <div className="mt-3 flex gap-4 text-xs text-zinc-500">
                  <span>支持 {item.supportCount}</span>
                  <span>反对 {item.opposeCount}</span>
                  <span>转发 {item.forwardCount}</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
