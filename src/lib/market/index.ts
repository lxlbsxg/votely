import type { MarketDataProvider } from "./types";
import { finnhubProvider } from "./finnhub";
import { coingeckoProvider } from "./coingecko";
import type { AssetType } from "@/generated/prisma/client";

export function getMarketDataProvider(type: AssetType): MarketDataProvider {
  return type === "STOCK" ? finnhubProvider : coingeckoProvider;
}

export type { Candle, NewsItem, AssetProfile, MarketDataProvider } from "./types";
