import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold">Sign in</h1>

        <form
          action={async (formData) => {
            "use server";
            await signIn("nodemailer", {
              email: formData.get("email"),
              redirectTo: "/",
            });
          }}
          className="mt-6 flex flex-col gap-3"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="rounded-md border border-black/[.12] bg-white px-4 py-2 text-sm dark:border-white/[.145] dark:bg-black"
          />
          <button
            type="submit"
            className="rounded-full bg-foreground px-5 py-2 text-sm text-background"
          >
            Send magic link
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-zinc-500">
          <div className="h-px flex-1 bg-black/[.08] dark:bg-white/[.145]" />
          or
          <div className="h-px flex-1 bg-black/[.08] dark:bg-white/[.145]" />
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("guest", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-full border border-black/[.12] px-5 py-2 text-sm hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            Continue as guest
          </button>
        </form>
      </div>
    </div>
  );
}
