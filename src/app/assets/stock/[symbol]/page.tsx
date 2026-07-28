import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AssetPageContent } from "@/components/AssetPageContent";

type Props = {
  params: Promise<{ symbol: string }>;
};

export default async function StockAssetPage({ params }: Props) {
  const { symbol } = await params;
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return <AssetPageContent type="STOCK" providerId={symbol.toUpperCase()} />;
}
