import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listConversations } from "@/lib/actions/chat";

type ConversationSummary = Awaited<ReturnType<typeof listConversations>>[number];

function conversationLabel(
  conversation: ConversationSummary,
  currentUserId: string,
) {
  if (conversation.isGroup) return conversation.group?.name ?? "Group";
  const other = conversation.members.find(
    (m) => m.user.id !== currentUserId,
  )?.user;
  if (!other) return "Conversation";
  return other.isAnonymous ? "Guest user" : (other.name ?? other.email ?? "User");
}

function lastMessagePreview(conversation: ConversationSummary) {
  const message = conversation.messages[0];
  if (!message) return "";
  if (message.type === "FORWARD") return "Forwarded an opinion";
  if (message.type === "IMAGE") return "Sent an image";
  return message.text ?? "";
}

export default async function ChatListPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const conversations = await listConversations();

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-semibold">Chats</h1>
        {conversations.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No conversations yet. Add a friend or create a group to start
            chatting.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-black/[.08] dark:divide-white/[.145]">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/chat/${c.id}`}
                  className="flex items-center justify-between py-3 text-sm hover:underline"
                >
                  <span>{conversationLabel(c, session.user.id)}</span>
                  <span className="text-xs text-zinc-500">
                    {lastMessagePreview(c)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
