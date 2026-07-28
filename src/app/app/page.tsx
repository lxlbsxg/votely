import Link from "next/link";

export default function AppPage() {
  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-2xl font-semibold">App</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Placeholder page.</p>
        <Link href="/" className="mt-8 inline-block text-sm hover:underline">
          &larr; Back to Feed
        </Link>
      </div>
    </div>
  );
}
