import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getConversation, sendMessage } from "@/lib/actions/chat";

type Props = {
  params: Promise<{ conversationId: string }>;
};

function displayName(u: {
  name: string | null;
  email: string | null;
  isAnonymous: boolean;
}) {
  if (u.isAnonymous) return "Guest user";
  return u.name ?? u.email ?? "User";
}

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params;
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const conversation = await getConversation(conversationId);
  if (!conversation) notFound();

  const title = conversation.isGroup
    ? (conversation.group?.name ?? "Group")
    : displayName(
        conversation.members.find((m) => m.user.id !== session.user.id)
          ?.user ?? { isAnonymous: true, name: null, email: null },
      );

  const sendMessageWithId = sendMessage.bind(null, conversationId);

  return (
    <div className="flex flex-1 flex-col px-6 py-8">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
        <h1 className="text-xl font-semibold">{title}</h1>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
          {conversation.messages.map((m) => (
            <div
              key={m.id}
              className={m.senderId === session.user.id ? "text-right" : "text-left"}
            >
              {m.type === "FORWARD" && m.forward ? (
                <Link
                  href={`/forward/${m.forward.id}`}
                  className="inline-block max-w-xs rounded-lg border border-black/[.12] p-3 text-left text-sm hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.06]"
                >
                  <p className="text-xs text-zinc-500">Forwarded an opinion</p>
                  <p className="mt-1 line-clamp-2">{m.forward.content.body}</p>
                </Link>
              ) : m.type === "IMAGE" && m.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.imageUrl}
                  alt=""
                  className="inline-block max-h-64 rounded-lg"
                />
              ) : (
                <p className="inline-block max-w-xs rounded-lg bg-black/[.05] px-3 py-2 text-sm dark:bg-white/[.08]">
                  {m.text}
                </p>
              )}
            </div>
          ))}
        </div>

        <form
          action={sendMessageWithId}
          encType="multipart/form-data"
          className="mt-4 flex items-center gap-2"
        >
          <input
            type="text"
            name="text"
            placeholder="Message..."
            className="flex-1 rounded-full border border-black/[.12] bg-white px-4 py-2 text-sm dark:border-white/[.145] dark:bg-black"
          />
          <input
            type="file"
            name="image"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            id="chat-image-input"
          />
          <label
            htmlFor="chat-image-input"
            className="cursor-pointer rounded-full border border-black/[.12] px-3 py-2 text-xs dark:border-white/[.145]"
          >
            Image
          </label>
          <button
            type="submit"
            className="rounded-full bg-foreground px-4 py-2 text-sm text-background"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
