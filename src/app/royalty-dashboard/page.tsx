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
    if (!wallet) return;
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
  }, [wallet]);

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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4 space-y-6">
      <h1 className="text-3xl font-bold">Royalty Claim Dashboard</h1>
      <p className="text-sm text-gray-400">Connected wallet WIP balance: {wipBal}</p>
      <div className="w-full max-w-md space-y-4">
        <input
          placeholder="Your IP ID (0x...)"
          value={ancestorIpId}
          onChange={(e) => setAncestorIpId(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
        />
        <button
          onClick={handleClaim}
          disabled={claiming || !wallet}
          className="w-full py-2 bg-blue-500 rounded disabled:opacity-50"
        >
          {claiming ? "Claiming..." : "Claim Revenue"}
        </button>
      </div>
    </main>
  );
} 