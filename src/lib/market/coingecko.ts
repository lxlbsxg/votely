import type { AssetProfile, Candle, MarketDataProvider, NewsItem } from "./types";

const BASE_URL = "https://api.coingecko.com/api/v3";

// CoinGecko's OHLC endpoint only accepts these specific day counts.
function nearestAllowedDays(days: number): number {
  const allowed = [1, 7, 14, 30, 90, 180, 365];
  return allowed.reduce((best, d) =>
    Math.abs(d - days) < Math.abs(best - days) ? d : best,
  );
}

type CoinResponse = {
  name: string;
  description?: { en?: string };
  image?: { large?: string };
};

export const coingeckoProvider: MarketDataProvider = {
  async getProfile(id: string): Promise<AssetProfile> {
    const res = await fetch(
      `${BASE_URL}/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`,
    );
    if (!res.ok) throw new Error(`CoinGecko coin request failed: ${res.status}`);
    const data: CoinResponse = await res.json();

    const rawDescription = data.description?.en ?? "";
    // CoinGecko descriptions are long HTML-ish prose; keep it short and strip tags.
    const description = rawDescription
      .replace(/<[^>]*>/g, "")
      .split("\n")[0]
      .slice(0, 500);

    return {
      name: data.name ?? id,
      description: description || `No description available for ${id}.`,
      logoUrl: data.image?.large ?? null,
    };
  },

  async getCandles(id: string, days: number): Promise<Candle[]> {
    const res = await fetch(
      `${BASE_URL}/coins/${encodeURIComponent(id)}/ohlc?vs_currency=usd&days=${nearestAllowedDays(days)}`,
    );
    if (!res.ok) throw new Error(`CoinGecko OHLC request failed: ${res.status}`);
    const data: [number, number, number, number, number][] = await res.json();

    return data.map(([timeMs, open, high, low, close]) => ({
      time: Math.floor(timeMs / 1000),
      open,
      high,
      low,
      close,
    }));
  },

  // CoinGecko's free public API has no per-coin news endpoint - crypto
  // support is intentionally the thinner of the two per the roadmap ("先支持
  // 股票"), so this returns empty rather than integrating a second provider.
  async getNews(): Promise<NewsItem[]> {
    return [];
  },
};
