"use client";

import { useState, useEffect } from "react";
import { useWalletClient, usePublicClient } from "wagmi";
import { getStoryClient } from "@/lib/story-client";
import { WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk";
import { formatEther } from "viem";

const erc20Abi = [
  {"constant":true,"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"}
];

export default function RoyaltyDashboard() {
  const { data: wallet } = useWalletClient();
  const publicClient = usePublicClient();
  const [ancestorIpId, setAncestorIpId] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [wipBal, setWipBal] = useState<string>("-");

  async function refreshBalance() {
    if (!wallet || !publicClient) return;
    try {
      const bal = await publicClient.readContract({
        address: WIP_TOKEN_ADDRESS,
        abi: erc20Abi as any,
        functionName: "balanceOf",
        args: [wallet.account.address],
      });
      setWipBal(formatEther(bal as bigint));
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    refreshBalance();
  }, [wallet, publicClient]);

  async function handleClaim() {
    if (!wallet) {
      alert("Connect wallet");
      return;
    }
    if (!ancestorIpId) {
      alert("Enter ancestor IP ID");
      return;
    }

    try {
      setClaiming(true);
      const client = await getStoryClient(wallet);
      const resp = await client.royalty.claimAllRevenue({
        ancestorIpId: ancestorIpId as `0x${string}`,
        claimer: ancestorIpId as `0x${string}`,
        currencyTokens: [WIP_TOKEN_ADDRESS],
        childIpIds: [],
        royaltyPolicies: [],
        claimOptions: {
          autoTransferAllClaimedTokensFromIp: true,
          autoUnwrapIpTokens: true,
        },
      } as any);
      console.log("[Medlo] claimAllRevenue response", resp);
      alert("Claimed! Check wallet balance");
      await refreshBalance();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Claim failed");
    } finally {
      setClaiming(false);
    }
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

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-[#A8FF60] tracking-wider mb-4">ROYALTY DASHBOARD</h1>
          <p className="text-gray-400 font-pixel text-sm">Claim your IP revenue</p>
        </div>

        <div className="w-full max-w-lg space-y-6 bg-[#232426] border-2 border-[#A8FF60] p-8">
          <div className="flex items-center justify-between p-4 bg-[#1A1C1D] border border-[#3E4044]">
            <span className="text-[#A8FF60] font-pixel text-sm">WIP BALANCE</span>
            <span className="text-gray-100 font-mono text-lg">{wipBal}</span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-pixel text-[#A8FF60] uppercase tracking-wider">
              Your IP ID
            </label>
            <input
              placeholder="0x..."
              value={ancestorIpId}
              onChange={(e) => setAncestorIpId(e.target.value)}
              className="w-full p-3 bg-[#1A1C1D] border border-[#3E4044] text-gray-100 font-mono text-sm focus:outline-none focus:border-[#A8FF60] transition-colors"
            />
          </div>

          <button
            onClick={handleClaim}
            disabled={claiming || !wallet}
            className="w-full py-4 px-6 rounded-none bg-gradient-to-r from-[#A8FF60] to-[#C0FF8C] text-[#181A1B] font-bold hover:from-[#C0FF8C] hover:to-[#A8FF60] transition-all duration-200 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-pixel text-sm"
          >
            {claiming ? "CLAIMING..." : "CLAIM REVENUE"}
          </button>
        </div>
      </main>
    </div>
  );
} 