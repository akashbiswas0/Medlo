"use client";
import React, { useEffect, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { getStoryClient } from '@/lib/story-client';

interface IpAsset {
  id: string;
  ip_id: `0x${string}`;
  image_url: string;
  model_id: string;
  creator_address: string;
  license_terms: any;
}

export default function RoyaltyDashboard() {
  const { address, isConnected } = useAccount();
  const { data: wallet } = useWalletClient();
  const [claimableIps, setClaimableIps] = useState<IpAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimingIpId, setClaimingIpId] = useState<string | null>(null);
  const [claimLogs, setClaimLogs] = useState<Array<{ type: string; message: string; timestamp: string; data?: any }>>([]);

  const addLog = (type: string, message: string, data?: any) => {
    // Serialize data safely, handling BigInt values
    const serializeData = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj === 'bigint') return obj.toString();
      if (typeof obj === 'object') {
        if (Array.isArray(obj)) {
          return obj.map(serializeData);
        }
        const serialized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          serialized[key] = serializeData(value);
        }
        return serialized;
      }
      return obj;
    };

    const serializedData = data ? serializeData(data) : undefined;
    
    const log = {
      type,
      message,
      timestamp: new Date().toISOString(),
      data: serializedData
    };
    console.log(`[Royalty Dashboard - ${type}]`, message, serializedData || '');
    setClaimLogs(prev => [...prev, log]);
  };

  useEffect(() => {
    async function fetchRoyaltyIps() {
      if (isConnected && address) {
        setLoading(true);
        setError('');
        addLog('FETCH', `Starting to fetch royalty IPs for address: ${address}`);
        
        try {
          const response = await fetch(`/api/royalty-ips?walletAddress=${address}`);
          addLog('FETCH', `API response status: ${response.status}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            addLog('ERROR', `API request failed with status ${response.status}`, { errorText });
            throw new Error('Failed to fetch claimable IPs.');
          }
          
          const data = await response.json();
          addLog('FETCH', `Successfully fetched ${data.length} IP assets`, data);
          setClaimableIps(data);
        } catch (err: any) {
          addLog('ERROR', `Error fetching royalty IPs: ${err.message}`, err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        addLog('INFO', 'Wallet not connected, clearing IP assets');
        setClaimableIps([]);
        setLoading(false);
      }
    }

    fetchRoyaltyIps();
  }, [isConnected, address]);

  const handleClaimRoyalty = async (ip: IpAsset) => {
    if (!wallet) {
      addLog('ERROR', 'Wallet not connected');
      alert('Please connect your wallet first');
      return;
    }

    addLog('CLAIM_START', `Starting royalty claim for IP: ${ip.ip_id}`, ip);
    setClaimingIpId(ip.id);

    try {
      // Step 1: Initialize Story Client
      addLog('CLAIM_STEP', 'Initializing Story Protocol client');
      const client = await getStoryClient(wallet);
      addLog('CLAIM_STEP', 'Story Protocol client initialized successfully');

            // Step 2: Investigate royalty setup for this IP
      addLog('CLAIM_STEP', `Investigating royalty setup for IP: ${ip.ip_id}`);
      addLog('CLAIM_STEP', `Wallet address: ${address}`);
      
      // Step 3: Check claimable revenue first
      addLog('CLAIM_STEP', 'Checking claimable revenue before attempting claim');
      
      try {
        // First, let's check if there's any claimable revenue
        const claimableAmount = await client.royalty.claimableRevenue({
          ipId: ip.ip_id,
          claimer: ip.ip_id, // IP itself as claimer (owner of royalty tokens)
          token: '0x1514000000000000000000000000000000000000', // WIP token
        });
        
        addLog('CLAIM_STEP', `Claimable revenue for IP as claimer: ${claimableAmount.toString()}`);
        
        // Also check if wallet can claim
        const walletClaimable = await client.royalty.claimableRevenue({
          ipId: ip.ip_id,
          claimer: address as `0x${string}`,
          token: '0x1514000000000000000000000000000000000000', // WIP token
        });
        
        addLog('CLAIM_STEP', `Claimable revenue for wallet as claimer: ${walletClaimable.toString()}`);
        
        // If no revenue is claimable, inform the user
        if (claimableAmount === 0n && walletClaimable === 0n) {
          addLog('CLAIM_ERROR', 'No claimable revenue found for this IP');
          alert('❌ No royalty revenue available to claim for this IP asset.\n\nThis could mean:\n- No one has minted licenses for this IP\n- Revenue has already been claimed\n- The IP has no child IPs generating revenue');
          return;
        }
        
        // Step 4: Get royalty vault address
        const vaultAddress = await client.royalty.getRoyaltyVaultAddress(ip.ip_id);
        addLog('CLAIM_STEP', `Royalty vault address: ${vaultAddress}`);
        
        // Step 5: Attempt to claim revenue
        // Based on documentation, we need to understand the parent-child relationship
        addLog('CLAIM_STEP', 'Attempting to claim revenue with correct parameters');
        
        // Try claiming with IP as both ancestor and claimer (most common case)
        const claimResult = await client.royalty.claimAllRevenue({
          ancestorIpId: ip.ip_id, // This IP is the ancestor
          claimer: ip.ip_id, // IP itself claims (owner of royalty tokens)
          childIpIds: [], // No child IPs in this case
          royaltyPolicies: ['0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E'], // LAP royalty policy
          currencyTokens: ['0x1514000000000000000000000000000000000000'], // WIP token
          claimOptions: {
            autoTransferAllClaimedTokensFromIp: true, // Transfer to wallet
            autoUnwrapIpTokens: false, // Keep as WIP
          },
        });
        
        addLog('CLAIM_SUCCESS', 'Royalty claim succeeded', claimResult);
        
        // Show detailed success information
        const txHash = claimResult.txHashes?.[0] || 'Transaction submitted';
        const claimedTokens = claimResult.claimedTokens || [];
        
        let message = `✅ Royalty claim successful!\n\nTransaction Hash: ${txHash}`;
        if (claimedTokens.length > 0) {
          message += `\n\nClaimed Tokens:`;
          claimedTokens.forEach(token => {
            const amount = typeof token.amount === 'bigint' ? token.amount.toString() : token.amount;
            message += `\n- ${amount} tokens at ${token.token}`;
          });
        }
        message += `\n\nTokens should now be in your wallet. Check your WIP balance.`;
        
        alert(message);
        
        // Refresh to show updated status
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        
      } catch (claimError: any) {
        addLog('CLAIM_ERROR', 'Initial claim attempt failed', claimError);
        
        // Try alternative: wallet as claimer
        addLog('CLAIM_STEP', 'Trying with wallet as claimer instead of IP');
        
        try {
          const alternativeResult = await client.royalty.claimAllRevenue({
            ancestorIpId: ip.ip_id,
            claimer: address as `0x${string}`, // Wallet as claimer
            childIpIds: [],
            royaltyPolicies: ['0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E'],
            currencyTokens: ['0x1514000000000000000000000000000000000000'],
            claimOptions: {
              autoTransferAllClaimedTokensFromIp: true,
              autoUnwrapIpTokens: false,
            },
          });
          
          addLog('CLAIM_SUCCESS', 'Alternative claim succeeded', alternativeResult);
          
          const txHash = alternativeResult.txHashes?.[0] || 'Transaction submitted';
          const claimedTokens = alternativeResult.claimedTokens || [];
          
          let message = `✅ Royalty claim successful! (Alternative method)\n\nTransaction Hash: ${txHash}`;
          if (claimedTokens.length > 0) {
            message += `\n\nClaimed Tokens:`;
            claimedTokens.forEach(token => {
              const amount = typeof token.amount === 'bigint' ? token.amount.toString() : token.amount;
              message += `\n- ${amount} tokens at ${token.token}`;
            });
          }
          
          alert(message);
          
          setTimeout(() => {
            window.location.reload();
          }, 3000);
          
        } catch (alternativeError: any) {
          addLog('CLAIM_ERROR', 'All claim methods failed', alternativeError);
          
          alert(`❌ Royalty claim failed!\n\nPrimary error: ${claimError.message}\n\nAlternative error: ${alternativeError.message}\n\nPlease check the debug logs for more details.`);
        }
      }

    } catch (error: any) {
      addLog('CLAIM_ERROR', `Royalty claim failed: ${error.message}`, {
        error: error.message,
        stack: error.stack,
        code: error.code,
        reason: error.reason,
        ipId: ip.ip_id,
        walletAddress: address
      });
      
      console.error('Full royalty claim error:', error);
      alert(`Royalty claim failed: ${error.message}`);
    } finally {
      setClaimingIpId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#181A1B] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#A8FF60] mb-2 font-mono" style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }}>
          Royalty Dashboard
        </h1>
        <p className="text-gray-400 mb-8" style={{ fontFamily: '"Fira Mono", monospace' }}>
          View and claim your earnings from licensed IP assets.
        </p>
        
        {/* Debug Logs Section */}
        {claimLogs.length > 0 && (
          <div className="mb-8 bg-[#232426] border border-[#393B3C] rounded-lg p-4">
            <h3 className="text-lg font-bold text-[#A8FF60] mb-4">Debug Logs</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {claimLogs.slice(-10).map((log, index) => (
                <div key={index} className="text-xs font-mono">
                  <span className="text-gray-400">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
                  <span className={`ml-2 px-2 py-1 rounded ${
                    log.type === 'ERROR' || log.type === 'CLAIM_ERROR' ? 'bg-red-900 text-red-200' :
                    log.type === 'WARNING' ? 'bg-yellow-900 text-yellow-200' :
                    log.type === 'CLAIM_SUCCESS' ? 'bg-green-900 text-green-200' :
                    'bg-blue-900 text-blue-200'
                  }`}>
                    {log.type}
                  </span>
                  <span className="ml-2 text-gray-300">{log.message}</span>
                  {log.data && (
                    <details className="ml-4 mt-1">
                      <summary className="text-gray-500 cursor-pointer">Show data</summary>
                      <pre className="mt-1 text-gray-400 text-xs overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {loading && <p>Loading your assets...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {!loading && !error && claimableIps.length === 0 && (
          <p>No claimable IP assets found for your connected wallet.</p>
        )}

        {!loading && !error && claimableIps.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {claimableIps.map((ip) => (
              <div key={ip.id} className="bg-[#232426] rounded-lg shadow-lg overflow-hidden border border-[#393B3C] transition-all duration-300 hover:shadow-cyan-500/50 hover:border-cyan-500">
                <img src={ip.image_url} alt={`IP Asset ${ip.ip_id}`} className="w-full h-64 object-cover" />
                <div className="p-4">
                  <p className="text-sm text-gray-400 font-mono break-all" title={ip.ip_id}>
                    Asset ID: {`${ip.ip_id.substring(0, 6)}...${ip.ip_id.substring(ip.ip_id.length - 4)}`}
                  </p>
                  <button
                    onClick={() => handleClaimRoyalty(ip)}
                    disabled={claimingIpId === ip.id}
                    className="mt-4 w-full py-2 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {claimingIpId === ip.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Claiming Royalty...
                      </>
                    ) : (
                      'Claim Royalty'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 