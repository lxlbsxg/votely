import type { AssetProfile, Candle, MarketDataProvider, NewsItem } from "./types";

const BASE_URL = "https://finnhub.io/api/v1";

function apiKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("FINNHUB_API_KEY is not configured");
  return key;
}

type Profile2Response = {
  name?: string;
  logo?: string;
  weburl?: string;
  finnhubIndustry?: string;
  exchange?: string;
  marketCapitalization?: number;
  ticker?: string;
};

type CandleResponse = {
  s: string;
  t?: number[];
  o?: number[];
  h?: number[];
  l?: number[];
  c?: number[];
};

type CompanyNewsItem = {
  headline: string;
  url: string;
  source?: string;
  datetime: number;
};

export const finnhubProvider: MarketDataProvider = {
  async getProfile(symbol: string): Promise<AssetProfile> {
    const res = await fetch(
      `${BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${apiKey()}`,
    );
    if (!res.ok) throw new Error(`Finnhub profile request failed: ${res.status}`);
    const data: Profile2Response = await res.json();

    // Finnhub's free-tier profile has no prose description field, so build
    // a short one from what it does give us.
    const parts = [
      data.finnhubIndustry ? `${data.finnhubIndustry} company` : "Company",
      data.exchange ? `listed on ${data.exchange}` : null,
      data.marketCapitalization
        ? `with a market cap of roughly $${Math.round(data.marketCapitalization).toLocaleString()}M`
        : null,
    ].filter(Boolean);

    return {
      name: data.name ?? symbol,
      description: `${parts.join(" ")}.`,
      logoUrl: data.logo ?? null,
    };
  },

  async getCandles(symbol: string, days: number): Promise<Candle[]> {
    const to = Math.floor(Date.now() / 1000);
    const from = to - days * 24 * 60 * 60;
    const res = await fetch(
      `${BASE_URL}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${to}&token=${apiKey()}`,
    );
    if (!res.ok) throw new Error(`Finnhub candle request failed: ${res.status}`);
    const data: CandleResponse = await res.json();
    if (data.s !== "ok" || !data.t) return [];

    return data.t.map((time, i) => ({
      time,
      open: data.o![i],
      high: data.h![i],
      low: data.l![i],
      close: data.c![i],
    }));
  },

  async getNews(symbol: string): Promise<NewsItem[]> {
    const to = new Date();
    const from = new Date(to.getTime() - 14 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const res = await fetch(
      `${BASE_URL}/company-news?symbol=${encodeURIComponent(symbol)}&from=${fmt(from)}&to=${fmt(to)}&token=${apiKey()}`,
    );
    if (!res.ok) throw new Error(`Finnhub news request failed: ${res.status}`);
    const data: CompanyNewsItem[] = await res.json();

    return data.slice(0, 10).map((item) => ({
      headline: item.headline,
      url: item.url,
      source: item.source ?? null,
      publishedAt: new Date(item.datetime * 1000).toISOString(),
    }));
  },
};
