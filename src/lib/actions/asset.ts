"use server";

import { prisma } from "@/lib/prisma";
import { getMarketDataProvider } from "@/lib/market";
import type { AssetType } from "@/generated/prisma/client";

const CANDLE_DAYS = 90;

export async function getOrCreateAsset(type: AssetType, providerId: string) {
  const existing = await prisma.asset.findUnique({
    where: { type_providerId: { type, providerId } },
  });
  if (existing) return existing;

  const provider = getMarketDataProvider(type);
  const profile = await provider.getProfile(providerId);

  return prisma.asset.create({
    data: {
      type,
      providerId,
      symbol: providerId.toUpperCase(),
      name: profile.name,
    },
  });
}

export async function getAssetMarketData(
  type: AssetType,
  providerId: string,
) {
  const provider = getMarketDataProvider(type);
  const [profile, candles, news] = await Promise.all([
    provider.getProfile(providerId),
    provider.getCandles(providerId, CANDLE_DAYS),
    provider.getNews(providerId),
  ]);
  return { profile, candles, news };
}

export type VoteAggregate = {
  support: number;
  oppose: number;
  total: number;
  supportPct: number;
  opposePct: number;
};

export async function getAssetVoteAggregate(
  assetId: string,
): Promise<VoteAggregate> {
  const votes = await prisma.vote.findMany({
    where: { content: { assetId }, type: { in: ["SUPPORT", "OPPOSE"] } },
    select: { type: true },
  });

  const support = votes.filter((v) => v.type === "SUPPORT").length;
  const oppose = votes.filter((v) => v.type === "OPPOSE").length;
  const total = support + oppose;

  return {
    support,
    oppose,
    total,
    supportPct: total > 0 ? (support / total) * 100 : 0,
    opposePct: total > 0 ? (oppose / total) * 100 : 0,
  };
}
