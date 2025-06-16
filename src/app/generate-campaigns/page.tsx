'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { uploadFileToIPFS, uploadJSONToIPFS } from '@/lib/pinata';
import { getStoryClient } from '@/lib/story-client';
import { useWalletClient } from 'wagmi';
import { zeroAddress, parseEther } from 'viem';
import { useRouter } from 'next/navigation';

const MODEL_OPTIONS = [
  { id: 'stable-diffusion', name: 'coming soon', description: 'Best for general image generation' },
  { id: 'midjourney', name: 'Midjourney Style', description: 'Artistic and creative outputs' },
  { id: 'dall-e', name: 'DALL-E', description: 'Photorealistic and detailed images' },
  { id: 'custom', name: 'Custom Model', description: 'Use your own fine-tuned model' },
];

const ASPECT_RATIO_OPTIONS = [
  { id: '1:1', name: '1:1 (Square)' },
  { id: '3:2', name: '3:2 (Landscape)' },
  { id: '2:3', name: '2:3 (Portrait)' },
  { id: '16:9', name: '16:9 (Widescreen)' },
  { id: 'custom', name: 'Custom' },
];

const ASPECT_RATIO_PRESETS: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '3:2': { width: 1152, height: 768 },
  '2:3': { width: 768, height: 1152 },
  '16:9': { width: 1280, height: 720 },
  // 'custom' is not included here
};

// constants for royalty owners
const PLATFORM_ADDRESS = (process.env.NEXT_PUBLIC_PLATFORM_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`;
const BASE_MODEL_ADDRESS = (process.env.NEXT_PUBLIC_BASE_MODEL_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`;
const CREATOR_ADDRESS: `0x${string}` = '0x2c60e247978Ee3074DffD1d9626Ed5BC7DD211C1';
// Will lazily create a private SPG collection on first use
const PUBLIC_SPG_COLLECTION = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc' as const;
const WIP_TOKEN = '0x1514000000000000000000000000000000000000' as const;
const ROYALTY_POLICY_LAP = '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E' as const;

// helper to sha256 and hex encode
async function sha256Hex(data: ArrayBuffer | string) {
  const buf = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Add custom serializer for BigInt
const serializeBigInt = (data: any): any => {
  if (typeof data === 'bigint') {
    return data.toString();
  }
  if (Array.isArray(data)) {
    return data.map(serializeBigInt);
  }
  if (typeof data === 'object' && data !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializeBigInt(value);
    }
    return result;
  }
  return data;
};

export default function TestPage() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].id);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(ASPECT_RATIO_OPTIONS[0].id);
  const [isAspectRatioDropdownOpen, setIsAspectRatioDropdownOpen] = useState(false);
  const [width, setWidth] = useState(768);
  const [height, setHeight] = useState(768);
  const [consoleLogs, setConsoleLogs] = useState<Array<{ type: string; data: any; timestamp: string }>>([]);

  const { data: wallet } = useWalletClient();

  const [ipCreating, setIpCreating] = useState(false);
  const [ipTx, setIpTx] = useState<string | null>(null);
  const [ipId, setIpId] = useState<string | null>(null);

  const router = useRouter();

  const enhancePrompt = async () => {
    if (!prompt.trim()) {
      setError('Prompt cannot be empty.');
      return;
    }

    setEnhancing(true);
    setError('');

    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to enhance prompt');
      }

      const data = await response.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during prompt enhancement.');
    } finally {
      setEnhancing(false);
    }
  };

  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt before generating an image.');
      return;
    }

    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          model: selectedModel,
          aspectRatio: selectedAspectRatio,
          height: selectedAspectRatio === 'custom'
            ? height
            : ASPECT_RATIO_PRESETS[selectedAspectRatio]?.height,
          width: selectedAspectRatio === 'custom'
            ? width
            : ASPECT_RATIO_PRESETS[selectedAspectRatio]?.width,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate image');
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setImageUrl('');
    setError('');
    setLoading(false);
    setEnhancing(false);
    setSelectedModel(MODEL_OPTIONS[0].id);
    setSelectedAspectRatio(ASPECT_RATIO_OPTIONS[0].id);
    setHeight(768);
    setWidth(768);
  };

  const createIp = async () => {
    if (!imageUrl || !wallet) {
      alert('Image not generated or wallet not connected');
      return;
    }

    try {
      setIpCreating(true);
      // fetch image as blob
      const imgRes = await fetch(imageUrl);
      const blob = await imgRes.blob();
      const file = new File([blob], 'generated.png', { type: blob.type || 'image/png' });
      
      // Add log for image fetch
      setConsoleLogs(prev => [...prev, {
        type: 'Image Fetch',
        data: { type: blob.type, size: blob.size },
        timestamp: new Date().toISOString()
      }]);

      // upload image to IPFS via Pinata
      const imageCid = await uploadFileToIPFS(file);
      const imageUri = `https://ipfs.io/ipfs/${imageCid}`;

      // Add log for IPFS upload
      setConsoleLogs(prev => [...prev, {
        type: 'IPFS Upload',
        data: { cid: imageCid, uri: imageUri },
        timestamp: new Date().toISOString()
      }]);

      // compute hash
      const imageHashHex = await sha256Hex(await blob.arrayBuffer());

      // Add log for hash computation
      setConsoleLogs(prev => [...prev, {
        type: 'Hash Computation',
        data: { hash: `0x${imageHashHex}` },
        timestamp: new Date().toISOString()
      }]);

      // build ipMetadata and nftMetadata
      const ipMetadata = {
        title: prompt.slice(0, 80) || 'Generated Image',
        description: prompt,
        image: imageUri,
        imageHash: `0x${imageHashHex}`,
        mediaUrl: imageUri,
        mediaHash: `0x${imageHashHex}`,
        mediaType: blob.type || 'image/png',
        creators: [
          {
            name: 'Medlo Creator',
            address: CREATOR_ADDRESS,
            description: 'Primary creator',
            contributionPercent: 99,
          },
          {
            name: 'Medlo Platform',
            address: (PLATFORM_ADDRESS || zeroAddress) as `0x${string}`,
            description: 'Platform fee',
            contributionPercent: 1,
          },
          {
            name: 'Base Model',
            address: (BASE_MODEL_ADDRESS || zeroAddress) as `0x${string}`,
            description: 'Base model',
            contributionPercent: 0,
          },
        ],
      } as const;

      const nftMetadata = {
        name: 'Medlo Ownership NFT',
        description: prompt,
        image: imageUri,
      } as const;

      // Add log for metadata creation
      setConsoleLogs(prev => [...prev, {
        type: 'Metadata Creation',
        data: { ipMetadata, nftMetadata },
        timestamp: new Date().toISOString()
      }]);

      // upload metadata JSON
      const [ipMetaCid, nftMetaCid] = await Promise.all([
        uploadJSONToIPFS(ipMetadata),
        uploadJSONToIPFS(nftMetadata),
      ]);

      // Add log for metadata upload
      setConsoleLogs(prev => [...prev, {
        type: 'Metadata Upload',
        data: { ipMetaCid, nftMetaCid },
        timestamp: new Date().toISOString()
      }]);

      const ipMetaHash = await sha256Hex(JSON.stringify(ipMetadata));
      const nftMetaHash = await sha256Hex(JSON.stringify(nftMetadata));

      // setup story client
      const client = await getStoryClient(wallet);

      // 0. create a fresh SPG NFT collection for this generation
      console.log('[Medlo] creating dedicated SPG collection...');
      const collectionResp = await client.nftClient.createNFTCollection({
        name: `Medlo NFT ${Date.now()}`,
        symbol: 'MEDLO',
        isPublicMinting: false,
        mintOpen: true,
        mintFeeRecipient: zeroAddress,
        contractURI: '',
      } as any);

      console.log('[Medlo] SPG collection created', collectionResp);

      // 1. mint + register IP (NFT ownership minted under SPG collection)
      const registerResp = await client.ipAsset.mintAndRegisterIp({
        spgNftContract: collectionResp.spgNftContract as `0x${string}`,
        ipMetadata: {
          ipMetadataURI: `https://ipfs.io/ipfs/${ipMetaCid}`,
          ipMetadataHash: `0x${ipMetaHash}`,
          nftMetadataURI: `https://ipfs.io/ipfs/${nftMetaCid}`,
          nftMetadataHash: `0x${nftMetaHash}`,
        },
      });

      // Add log for IP registration
      setConsoleLogs(prev => [...prev, {
        type: 'IP Registration',
        data: registerResp,
        timestamp: new Date().toISOString()
      }]);

      // 2. create or get license terms (1 $WIP default fee)
      const termsResp = await client.license.registerPILTerms({
        defaultMintingFee: parseEther('1'),
        currency: WIP_TOKEN,
        royaltyPolicy: ROYALTY_POLICY_LAP,
        transferable: false,
        expiration: 0n,
        commercialUse: true,
        commercialAttribution: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: '0x',
        commercialRevShare: 0,
        commercialRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: false,
        derivativeRevCeiling: 0n,
        uri: '',
      } as any);

      // Add log for license terms
      setConsoleLogs(prev => [...prev, {
        type: 'License Terms',
        data: termsResp,
        timestamp: new Date().toISOString()
      }]);

      const licenseTermsId = (termsResp.licenseTermsId ?? '0') as any;

      if (!registerResp.ipId) {
        throw new Error('IP registration did not return ipId');
      }

      const attachResp = await client.license.attachLicenseTerms({
        licenseTermsId,
        ipId: registerResp.ipId as `0x${string}`,
      });

      // Add log for license attachment
      setConsoleLogs(prev => [...prev, {
        type: 'License Attachment',
        data: attachResp,
        timestamp: new Date().toISOString()
      }]);

      const primaryTxHash = attachResp.txHash ?? registerResp.txHash ?? null;
      setIpTx(primaryTxHash);
      setIpId(registerResp.ipId ?? null);
      alert(`IP Asset created! Tx: ${primaryTxHash}`);

      setTimeout(() => {
        router.push('/mint-license');
      }, 2000);

      // Persist for later mint screen
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('medlo_ips') || '[]');
        stored.push({
          ipId: registerResp.ipId,
          licenseTermsId: licenseTermsId.toString(),
          image: imageUri,
        });
        localStorage.setItem('medlo_ips', JSON.stringify(stored));
      }
    } catch (err: any) {
      console.error(err);
      // Add log for error
      setConsoleLogs(prev => [...prev, {
        type: 'Error',
        data: { message: err?.message || 'Failed to create IP' },
        timestamp: new Date().toISOString()
      }]);
      alert(err?.message || 'Failed to create IP');
    } finally {
      setIpCreating(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel {
          font-family: 'Press Start 2P', 'Fira Mono', monospace;
        }
      `}</style>
      <div className="min-h-screen bg-[#1F2023] text-gray-200 font-sans">
        {/* Navbar */}
        <nav className="fixed top-0 w-full bg-[#292A2D] border-b border-[#3E4044] z-50">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-3xl font-extrabold text-gray-100 hover:text-[#A8FF60] transition-colors font-roboto tracking-wider">
                MEDLO
              </Link>
              <Link
                href="/mint-license"
                className="ml-4 px-4 py-2 bg-[#2E3034] border border-[#3E4044] rounded-md text-gray-100 hover:text-[#A8FF60] hover:border-[#A8FF60] transition-colors font-pixel font-extrabold text-base"
              >
                marketplace
              </Link>
            </div>
          </div>
        </nav>

        <main className="flex min-h-screen pt-16">
          {/* Left Side - Fixed Input Panel */}
          <div className="w-full lg:w-2/5 border-r border-[#3E4044] p-6 overflow-y-auto custom-scrollbar fixed h-[calc(100vh-4rem)]">
            <div className="mb-6">
              
            </div>
            {/* Prompt Input */}
            <div className="mb-6">
              <label htmlFor="prompt" className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
               user prompt
              </label>
              <textarea
                id="prompt"
                rows={8}
                className="w-full px-3 py-2 bg-[#2E3034] border border-[#3E4044] rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#A8FF60] focus:border-transparent resize-y"
                placeholder="Enter a detailed prompt for image generation..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading || enhancing}
              />
            </div>

            {/* Image File Input (placeholder) */}
            <div className="mb-6">
              <label htmlFor="image-file" className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                D image file
              </label>
              <input
                type="text"
                id="image-file"
                className="w-full px-3 py-2 bg-[#2E3034] border border-[#3E4044] rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#A8FF60] focus:border-transparent"
                placeholder="coming soon"
                disabled={true} // Placeholder for now
              />
            </div>

            {/* Mask File Input (placeholder) */}
            <div className="mb-6">
              <label htmlFor="mask-file" className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                mask file
              </label>
              <input
                type="text"
                id="mask-file"
                className="w-full px-3 py-2 bg-[#2E3034] border border-[#3E4044] rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#A8FF60] focus:border-transparent"
                placeholder="coming soon"
                disabled={true} // Placeholder for now
              />
            </div>

            {/* Aspect Ratio Dropdown */}
            <div className="mb-6">
              <label htmlFor="aspect-ratio" className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Aspect Ratio string
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAspectRatioDropdownOpen(!isAspectRatioDropdownOpen)}
                  className="w-full px-3 py-2 bg-[#2E3034] border border-[#3E4044] rounded-md text-left flex justify-between items-center text-gray-100 hover:border-[#A8FF60] transition-colors"
                >
                  {ASPECT_RATIO_OPTIONS.find(ar => ar.id === selectedAspectRatio)?.name}
                  <svg className={`w-4 h-4 transition-transform ${isAspectRatioDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isAspectRatioDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-[#2E3034] border border-[#3E4044] rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {ASPECT_RATIO_OPTIONS.map((ar) => (
                      <button
                        key={ar.id}
                        onClick={() => {
                          setSelectedAspectRatio(ar.id);
                          setIsAspectRatioDropdownOpen(false);
                          if (ar.id !== 'custom' && ASPECT_RATIO_PRESETS[ar.id]) {
                            setWidth(ASPECT_RATIO_PRESETS[ar.id].width);
                            setHeight(ASPECT_RATIO_PRESETS[ar.id].height);
                          }
                        }}
                        className="w-full px-3 py-2 text-left text-gray-100 hover:bg-[#3A3A3A] transition-colors border-b border-[#3E4044] last:border-b-0"
                      >
                        {ar.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Aspect ratio for the generated image. The size will always be 1 megapixel, i.e. 1024x1024 if aspect ratio is 1:1. To use arbitrary width and height, set aspect ratio to 'custom'. Default: &quot;1:1&quot;</p>
            </div>

            {/* Width Input with Slider */}
            <div className="mb-6">
              <label htmlFor="width" className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                # width integer (minimum: 256, maximum: 1440)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  id="width"
                  min={256}
                  max={1440}
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  className="w-24 px-3 py-2 bg-[#2E3034] border border-[#3E4044] rounded-md text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#A8FF60] focus:border-transparent"
                  disabled={loading || enhancing || selectedAspectRatio !== 'custom'}
                />
                <input
                  type="range"
                  min={256}
                  max={1440}
                  step={16} // Multiple of 16
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  className="flex-grow h-2 bg-[#3E4044] rounded-lg appearance-none cursor-pointer range-thumb-custom"
                  style={{'--webkit-slider-thumb-bg': '#A8FF60', '--moz-range-thumb-bg': '#A8FF60'} as React.CSSProperties}
                  disabled={loading || enhancing || selectedAspectRatio !== 'custom'}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Width of the generated image. Optional, only used when aspect_ratio=custom. Must be a multiple of 16 (if it's not, it will be rounded to nearest multiple of 16)</p>
            </div>

            {/* Height Input with Slider */}
            <div className="mb-6">
              <label htmlFor="height" className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                # height integer (minimum: 256, maximum: 1440)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  id="height"
                  min={256}
                  max={1440}
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-24 px-3 py-2 bg-[#2E3034] border border-[#3E4044] rounded-md text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#A8FF60] focus:border-transparent"
                  disabled={loading || enhancing || selectedAspectRatio !== 'custom'}
                />
                <input
                  type="range"
                  min={256}
                  max={1440}
                  step={16} // Multiple of 16
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="flex-grow h-2 bg-[#3E4044] rounded-lg appearance-none cursor-pointer range-thumb-custom"
                  style={{'--webkit-slider-thumb-bg': '#A8FF60', '--moz-range-thumb-bg': '#A8FF60'} as React.CSSProperties}
                  disabled={loading || enhancing || selectedAspectRatio !== 'custom'}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Height of the generated image. Optional, only used when aspect_ratio=custom. Must be a multiple of 16 (if it's not, it will be rounded to nearest multiple of 16)</p>
            </div>

            {/* Model Selection Dropdown (moved here to match flow) */}
            <div className="mb-6">
              <label htmlFor="model" className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Model
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="w-full px-3 py-2 bg-[#2E3034] border border-[#3E4044] rounded-md text-left flex justify-between items-center text-gray-100 hover:border-[#A8FF60] transition-colors"
                >
                  {MODEL_OPTIONS.find(m => m.id === selectedModel)?.name}
                  <svg className={`w-4 h-4 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isModelDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-[#2E3034] border border-[#3E4044] rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {MODEL_OPTIONS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setIsModelDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-gray-100 hover:bg-[#3A3A3A] transition-colors border-b border-[#3E4044] last:border-b-0"
                      >
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-gray-400">{model.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-6">Prompt for generated image. If you include the &apos;trigger_word&apos; used in the training process you are more likely to activate the trained object, style, or concept in the resulting image.</p>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700 text-red-400 rounded-md mb-4 flex items-center gap-2 text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto pt-6 border-t border-[#3E4044] flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-transparent text-gray-400 rounded-md hover:text-[#A8FF60] transition-colors text-sm font-medium"
              >
                Reset
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={enhancePrompt}
                  disabled={loading || enhancing || !prompt.trim()}
                  className="px-4 py-2 cursor-pointer bg-[#2E3034] border border-[#3E4044] rounded-md text-gray-100 hover:bg-[#3A3A3A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {enhancing ? 'Enhancing...' : '✨ Enhance'}
                </button>
                <button
                  type="submit"
                  onClick={generateImage}
                  disabled={loading || enhancing || !prompt.trim()}
                  className="px-4 py-2 bg-[#A8FF60] text-black rounded-md hover:bg-[#97E651] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base flex items-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Running...
                    </span>
                  ) : (
                    <>
                      Run
                     
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Scrollable Output Panel */}
          <div className="flex-grow lg:ml-[40%] p-6 flex flex-col items-center bg-[#1A1A1A] min-h-[calc(100vh-4rem)]">
            {loading ? (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 border-4 border-[#A8FF60] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="w-20 h-20 border-4 border-[#444444] border-r-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
                </div>
                <p className="text-lg font-medium">Generating your masterpiece...</p>
                <p className="mt-2 text-sm text-gray-500">This may take a few moments</p>
              </div>
            ) : imageUrl ? (
              <div className="flex flex-col items-center w-full max-w-4xl">
                {/* Image Container */}
                <div className="w-full flex justify-center items-center bg-[#1A1A1A] py-6">
                  <div className="relative w-full max-w-2xl">
                    <img
                      src={imageUrl}
                      alt="Generated image"
                      className="w-full h-auto rounded-lg border border-[#3E4044] shadow-lg"
                      onLoad={() => console.log('Image loaded.')}
                      onError={(e) => {
                        console.error('Image failed to load:', e);
                        setError('Failed to load image. URL might be invalid.');
                      }}
                    />
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      <Link
                        href="/generate-campaigns/selected-image"
                        className="px-3 py-1.5 bg-[#2E3034] text-gray-100 rounded-md hover:bg-[#3E4044] transition-colors text-xs font-medium border border-[#3E4044] flex items-center justify-center"
                      >
                        Select it
                      </Link>
                      <button className="px-3 py-1.5 bg-[#2E3034] text-gray-100 rounded-md hover:bg-[#3E4044] transition-colors text-xs font-medium border border-[#3E4044]">Share</button>
                      <button className="px-3 py-1.5 bg-[#2E3034] text-gray-100 rounded-md hover:bg-[#3E4044] transition-colors text-xs font-medium border border-[#3E4044]">Download</button>
                      <button 
                        onClick={createIp} 
                        disabled={ipCreating || !wallet}
                        className="px-3 py-1.5 bg-[#2E3034] text-gray-100 rounded-md hover:bg-[#3E4044] transition-colors text-xs font-medium border border-[#3E4044] disabled:opacity-50"
                      >
                        {ipCreating ? 'Creating IP...' : 'Create IP'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Console Logs Display */}
                {consoleLogs.length > 0 && (
                  <div className="w-full mt-4 bg-[#232426] border-2 border-[#A8FF60] rounded-lg p-4">
                    <h3 className="text-[#A8FF60] font-pixel text-lg mb-4">IP Creation Logs</h3>
                    <div className="space-y-4">
                      {consoleLogs.map((log, index) => (
                        <div key={index} className="bg-[#1A1C1D] p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[#A8FF60] font-pixel text-sm">{log.type}</span>
                            <span className="text-gray-400 font-pixel text-xs">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <pre className="text-gray-300 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(serializeBigInt(log.data), null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500">
                <svg className="w-24 h-24 mb-4 text-[#3E4044]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-base font-medium text-gray-400">Your generated image will appear here</p>
                <p className="mt-1 text-sm text-gray-500">Enter a prompt and click &quot;Run&quot; to create your image</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}