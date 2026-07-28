export type Candle = {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
};

export type NewsItem = {
  headline: string;
  url: string;
  source: string | null;
  publishedAt: string; // ISO
};

export type AssetProfile = {
  name: string;
  description: string;
  logoUrl: string | null;
};

export interface MarketDataProvider {
  getProfile(providerId: string): Promise<AssetProfile>;
  getCandles(providerId: string, days: number): Promise<Candle[]>;
  getNews(providerId: string): Promise<NewsItem[]>;
}
