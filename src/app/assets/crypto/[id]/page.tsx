import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AssetPageContent } from "@/components/AssetPageContent";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CryptoAssetPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return <AssetPageContent type="CRYPTO" providerId={id.toLowerCase()} />;
}
