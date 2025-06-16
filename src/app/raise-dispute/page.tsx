"use client";

import { useState } from "react";
import { useWalletClient } from "wagmi";
import { getStoryClient } from "@/lib/story-client";
import { uploadFileToIPFS } from "@/lib/pinata";
import { DisputeTargetTag } from "@story-protocol/core-sdk";

const TAGS = [
  { value: DisputeTargetTag.IMPROPER_REGISTRATION, label: "IMPROPER REGISTRATION" },
  { value: DisputeTargetTag.INVALID_CLAIM, label: "INVALID CLAIM" },
  { value: DisputeTargetTag.INVALID_LICENSE, label: "INVALID LICENSE" },
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
          <h1 className="text-5xl font-bold text-[#A8FF60] tracking-wider mb-4">RAISE DISPUTE</h1>
          <p className="text-gray-400 font-pixel text-sm">Submit evidence for IP disputes</p>
        </div>
        
        <div className="w-full max-w-lg space-y-6 bg-[#232426] border-2 border-[#A8FF60] p-8">
          <div className="space-y-2">
            <label className="block text-xs font-pixel text-[#A8FF60] uppercase tracking-wider">
              Target IP ID
            </label>
            <input
              placeholder="0x..."
              value={ipId}
              onChange={(e) => setIpId(e.target.value)}
              className="w-full p-3 bg-[#1A1C1D] border border-[#3E4044] text-gray-100 font-mono text-sm focus:outline-none focus:border-[#A8FF60] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-pixel text-[#A8FF60] uppercase tracking-wider">
              Dispute Type
            </label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value as unknown as DisputeTargetTag)}
              className="w-full p-3 bg-[#1A1C1D] border border-[#3E4044] text-gray-100 font-mono text-sm focus:outline-none focus:border-[#A8FF60] transition-colors"
            >
              {TAGS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-pixel text-[#A8FF60] uppercase tracking-wider">
              Evidence File
            </label>
            <div className="w-full p-3 bg-[#1A1C1D] border border-[#3E4044] text-gray-100 font-mono text-sm">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:bg-[#A8FF60] file:text-[#181A1B] file:border-0 file:font-pixel file:text-xs hover:file:bg-[#97E651] transition-colors"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !wallet}
            className="w-full py-4 px-6 rounded-none bg-gradient-to-r from-[#A8FF60] to-[#C0FF8C] text-[#181A1B] font-bold hover:from-[#C0FF8C] hover:to-[#A8FF60] transition-all duration-200 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-pixel text-sm"
          >
            {submitting ? "SUBMITTING..." : "SUBMIT DISPUTE"}
          </button>
        </div>
      </main>
    </div>
  );
} 