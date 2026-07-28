import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

async function goToStock(formData: FormData) {
  "use server";
  const symbol = (formData.get("symbol") as string | null)?.trim();
  if (!symbol) return;
  redirect(`/assets/stock/${encodeURIComponent(symbol.toUpperCase())}`);
}

async function goToCrypto(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;
  redirect(`/assets/crypto/${encodeURIComponent(id.toLowerCase())}`);
}

export default async function AssetsLandingPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Assets</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Look up a stock ticker or a crypto asset.
        </p>

        <form action={goToStock} className="mt-6 flex flex-col gap-2">
          <label className="text-sm font-medium">Stock ticker</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="symbol"
              required
              placeholder="e.g. AAPL"
              className="flex-1 rounded-md border border-black/[.12] bg-white px-4 py-2 text-sm dark:border-white/[.145] dark:bg-black"
            />
            <button
              type="submit"
              className="rounded-full bg-foreground px-4 py-2 text-sm text-background"
            >
              Go
            </button>
          </div>
        </form>

        <form action={goToCrypto} className="mt-6 flex flex-col gap-2">
          <label className="text-sm font-medium">Crypto asset id</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="id"
              required
              placeholder="e.g. bitcoin"
              className="flex-1 rounded-md border border-black/[.12] bg-white px-4 py-2 text-sm dark:border-white/[.145] dark:bg-black"
            />
            <button
              type="submit"
              className="rounded-full bg-foreground px-4 py-2 text-sm text-background"
            >
              Go
            </button>
          </div>
          <p className="text-xs text-zinc-500">
            Uses CoinGecko coin ids (e.g. bitcoin, ethereum, dogecoin).
          </p>
        </form>
      </div>
    </div>
  );
}
