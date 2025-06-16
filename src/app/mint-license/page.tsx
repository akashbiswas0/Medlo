"use client";

import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";
import { getStoryClient } from "@/lib/story-client";
import { WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk";

interface SavedIp {
  ipId: `0x${string}`;
  licenseTermsId: string;
  image?: string;
}

export default function MintLicensePage() {
  const { data: wallet } = useWalletClient();
  const [ips, setIps] = useState<SavedIp[]>([]);
  const [mintingId, setMintingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored: SavedIp[] = JSON.parse(localStorage.getItem("medlo_ips") || "[]");
      setIps(stored);
    }
  }, []);

  async function handleMint(ip: SavedIp) {
    if (!wallet) {
      alert("Connect wallet first");
      return;
    }

    try {
      setMintingId(ip.ipId);
      const client = await getStoryClient(wallet);
      const resp = await client.license.mintLicenseTokens({
        licensorIpId: ip.ipId,
        licenseTermsId: ip.licenseTermsId,
        maxMintingFee: 0n,
        maxRevenueShare: 100,
        amount: 1,
        currency: WIP_TOKEN_ADDRESS,
      } as any);
      console.log("[Medlo] mintLicenseTokens response", resp);
      alert(`License minted! Tx: ${resp.txHash}`);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Mint failed");
    } finally {
      setMintingId(null);
    }
  }

  if (!ips.length) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>No IP assets found. Mint one first.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Mint License Tokens</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ips.map((ip) => (
          <div key={ip.ipId} className="bg-gray-800 rounded p-4 flex flex-col items-center space-y-3">
            {ip.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ip.image} alt="ip" className="w-full h-48 object-cover rounded" />
            ) : (
              <div className="w-full h-48 bg-gray-700 rounded flex items-center justify-center text-gray-500">No Image</div>
            )}
            <code className="break-all text-xs">{ip.ipId}</code>
            <button
              onClick={() => handleMint(ip)}
              disabled={mintingId === ip.ipId || !wallet}
              className="w-full py-2 bg-green-600 rounded disabled:opacity-50"
            >
              {mintingId === ip.ipId ? "Minting..." : "Mint for 1 WIP"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
} 