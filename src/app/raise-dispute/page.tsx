"use client";

import { useState } from "react";
import { useWalletClient } from "wagmi";
import { getStoryClient } from "@/lib/story-client";
import { uploadFileToIPFS } from "@/lib/pinata";
import { DisputeTargetTag } from "@story-protocol/core-sdk";

const TAGS = [
  { value: DisputeTargetTag.IMPROPER_REGISTRATION, label: "Improper Registration" },
  { value: DisputeTargetTag.TERMS_VIOLATION, label: "Terms Violation" },
  { value: DisputeTargetTag.ROYALTY_BREACH, label: "Royalty Breach" },
] as const;

export default function RaiseDisputePage() {
  const { data: wallet } = useWalletClient();
  const [ipId, setIpId] = useState("");
  const [tag, setTag] = useState<DisputeTargetTag>(TAGS[0].value);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!wallet) return alert("Connect wallet first");
    if (!ipId || !file) return alert("Please enter IP ID and choose evidence file");

    try {
      setSubmitting(true);
      // 1. upload evidence to IPFS
      const cid = await uploadFileToIPFS(file);
      // 2. raise dispute via SDK
      const client = await getStoryClient(wallet);
      const resp = await client.dispute.raiseDispute({
        targetIpId: ipId as `0x${string}`,
        cid,
        targetTag: tag,
        bond: BigInt("100000000000000000"), // 0.1 IP
        liveness: 60n * 60n * 24n * 30n, // 30 days
      });
      console.log("[Medlo] Dispute raised", resp);
      alert(`Dispute raised! ID: ${resp.disputeId}`);
      setIpId("");
      setFile(null);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to raise dispute");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center gap-6 bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold">Raise Dispute</h1>
      <div className="w-full max-w-lg space-y-4">
        <input
          placeholder="Target IP ID (0x...)"
          value={ipId}
          onChange={(e) => setIpId(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
        />
        <select
          value={tag}
          onChange={(e) => setTag(Number(e.target.value) as DisputeTargetTag)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
        >
          {TAGS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-gray-400"
        />
        <button
          onClick={handleSubmit}
          disabled={submitting || !wallet}
          className="w-full py-2 bg-red-600 rounded disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit Dispute"}
        </button>
      </div>
    </main>
  );
} 