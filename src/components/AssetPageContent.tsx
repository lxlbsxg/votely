import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getOrCreateAsset,
  getAssetMarketData,
  getAssetVoteAggregate,
} from "@/lib/actions/asset";
import { CandlestickChart } from "@/components/CandlestickChart";
import { VoteAggregateBar } from "@/components/VoteAggregateBar";
import type { AssetType } from "@/generated/prisma/client";

type Props = {
  type: AssetType;
  providerId: string;
};

export async function AssetPageContent({ type, providerId }: Props) {
  const asset = await getOrCreateAsset(type, providerId).catch(() => null);
  if (!asset) notFound();

  const [marketData, voteAggregate] = await Promise.all([
    getAssetMarketData(type, providerId).catch(() => null),
    getAssetVoteAggregate(asset.id),
  ]);

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{asset.name}</h1>
            <p className="text-sm text-zinc-500">
              {asset.symbol} · {asset.type === "STOCK" ? "Stock" : "Crypto"}
            </p>
          </div>
          <Link
            href={`/publish?assetId=${asset.id}`}
            className="rounded-full bg-foreground px-4 py-2 text-sm text-background"
          >
            Publish opinion
          </Link>
        </div>

        {marketData ? (
          <>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              {marketData.profile.description}
            </p>

            <div className="mt-6 rounded-xl border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-900">
              <h2 className="mb-3 text-sm font-medium text-zinc-500">
                Price (last 90 days)
              </h2>
              <CandlestickChart candles={marketData.candles} />
            </div>

            <div className="mt-6">
              <h2 className="mb-2 text-sm font-medium text-zinc-500">
                Related news
              </h2>
              {marketData.news.length === 0 ? (
                <p className="text-sm text-zinc-500">No recent news available.</p>
              ) : (
                <ul className="space-y-2">
                  {marketData.news.map((item) => (
                    <li key={item.url}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline"
                      >
                        {item.headline}
                      </a>
                      {item.source && (
                        <span className="ml-2 text-xs text-zinc-500">
                          {item.source}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">
            Market data is temporarily unavailable for this asset.
          </p>
        )}

        <div className="mt-8">
          <h2 className="mb-2 text-sm font-medium text-zinc-500">
            Community sentiment
          </h2>
          <VoteAggregateBar aggregate={voteAggregate} />
        </div>
      </div>
    </div>
  );
}
