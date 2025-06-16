"use client";

import { useEffect, useState } from "react";
import { useWalletClient, useAccount } from "wagmi";
import { getStoryClient } from "@/lib/story-client";
import { WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk";
import Link from "next/link";

interface IpAsset {
  ip_id: `0x${string}`;
  license_terms_id: string;
  image_url?: string;
}

export default function MintLicensePage() {
  const { data: wallet } = useWalletClient();
  const { address: accountAddress, isConnected } = useAccount();
  const [ips, setIps] = useState<IpAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [mintingId, setMintingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchIpAssets = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/ip-assets`);
        if (!response.ok) {
          throw new Error("Failed to fetch IP assets");
        }
        const data: IpAsset[] = await response.json();
        setIps(data);
      } catch (error) {
        console.error("Error fetching IP assets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIpAssets();
  }, []);

  async function handleMint(ip: IpAsset) {
    if (!wallet) {
      alert("Connect wallet first");
      return;
    }

    try {
      setMintingId(ip.ip_id);
      const client = await getStoryClient(wallet);
      const resp = await client.license.mintLicenseTokens({
        licensorIpId: ip.ip_id,
        licenseTermsId: ip.license_terms_id,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181A1B] text-gray-100 font-pixel">
        <p>Loading your IP assets...</p>
      </div>
    );
  }

  if (!ips.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#181A1B] text-gray-100 font-pixel relative overflow-hidden">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          .font-pixel {
            font-family: 'Press Start 2P', 'Fira Mono', monospace;
          }
          body { background: #181A1B !important; }
        `}</style>
        {/* Grid background */}
        <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true"
          style={{
            backgroundImage:
              `linear-gradient(to right, rgba(168,255,96,0.07) 1px, transparent 1px),` +
              `linear-gradient(to bottom, rgba(168,255,96,0.07) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
        <p className="text-[#A8FF60] mb-4">No IP assets found. Mint one first.</p>
        <Link href="/generate-campaigns" className="px-4 py-2 bg-[#A8FF60] text-[#181A1B] rounded-md hover:bg-[#97E651] transition-colors font-pixel text-sm">
          Generate IP
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181A1B] text-gray-100 font-pixel relative overflow-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel {
          font-family: 'Press Start 2P', 'Fira Mono', monospace;
        }
        body { background: #181A1B !important; }
      `}</style>
      
      {/* Grid background */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true"
        style={{
          backgroundImage:
            `linear-gradient(to right, rgba(168,255,96,0.07) 1px, transparent 1px),` +
            `linear-gradient(to bottom, rgba(168,255,96,0.07) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <main className="relative z-10 p-6 space-y-6">
        <h1 className="text-3xl font-bold text-center text-[#A8FF60] tracking-wider">MINT LICENSE TOKENS</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {ips.map((ip) => (
            <div key={ip.ip_id} className="bg-[#232426] border-2 border-[#A8FF60] rounded-none p-4 flex flex-col items-center space-y-4">
              {ip.image_url ? (
                <div className="w-full aspect-square overflow-hidden rounded-none border border-[#3E4044]">
                  <img 
                    src={ip.image_url} 
                    alt="ip" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-square bg-[#1A1C1D] rounded-none border border-[#3E4044] flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
              <div className="w-full bg-[#1A1C1D] p-3 rounded-none border border-[#3E4044]">
                <code className="break-all text-xs text-gray-300 font-mono">{ip.ip_id}</code>
              </div>
              <button
                onClick={() => handleMint(ip)}
                disabled={mintingId === ip.ip_id || !wallet}
                className="w-full py-3 px-6 rounded-none bg-gradient-to-r from-[#A8FF60] to-[#C0FF8C] text-[#181A1B] font-bold hover:from-[#C0FF8C] hover:to-[#A8FF60] transition-all duration-200 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mintingId === ip.ip_id ? "MINTING..." : "MINT FOR 1 WIP"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 