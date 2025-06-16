"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConnectModal } from '@tomo-inc/tomo-evm-kit';
import { useAccount } from 'wagmi';
import { motion } from "framer-motion";

export default function Home() {
  const [connecting, setConnecting] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const router = useRouter();
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    // Set initial dimensions
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Update dimensions on resize
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Log wallet address when connected
  useEffect(() => {
    if (isConnected && address) {
      console.log('Wallet connected! Address:', address);
      // Automatically navigate to selection page after successful connection
      router.push("/selection");
    }
  }, [isConnected, address, router]);

  const handleConnectWallet = async () => {
    if (!openConnectModal) {
      alert("Tomo SDK is not properly initialized.");
      return;
    }
    setConnecting(true);
    try {
      openConnectModal();
    } catch (err) {
      console.error('Error opening connect modal:', err);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181A1B] text-gray-100 font-pixel relative overflow-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel {
          font-family: 'Press Start 2P', 'Fira Mono', monospace;
        }
        body { background: #181A1B !important; }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #232426;
        }
        ::-webkit-scrollbar-thumb {
          background: #A8FF60;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #97E651;
        }

        /* Aggressively ensure modals are on top */
        .tomo-modal-overlay,
        .tomo-modal-container,
        .wagmi-connect-modal,
        [data-rk] {
          z-index: 9999 !important;
        }

        /* How It Works step glow animation */
        @keyframes glow-step {
          0%, 100% { box-shadow: 0 0 8px #A8FF60, 0 0 16px #A8FF60; }
          50% { box-shadow: 0 0 24px #C0FF8C, 0 0 32px #A8FF60; }
        }
        .animate-glow-step {
          animation: glow-step 2s infinite alternate;
        }
      `}</style>

      {/* Floating elements animation */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        {dimensions.width > 0 && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#A8FF60]/20"
            initial={{
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Grid background */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none" 
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          backgroundImage:
            `linear-gradient(to right, rgba(168,255,96,0.05) 1px, transparent 1px),` +
            `linear-gradient(to bottom, rgba(168,255,96,0.05) 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      />

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full bg-[#232426]/80 backdrop-blur-md z-50 border-b border-[#A8FF60]/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-[#A8FF60] font-pixel tracking-wider">MEDLO</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#home" className="text-gray-300 hover:text-[#A8FF60] transition-colors font-pixel text-xs">HOME</Link>
              <Link href="#features" className="text-gray-300 hover:text-[#A8FF60] transition-colors font-pixel text-xs">FEATURES</Link>
              <Link href="#about" className="text-gray-300 hover:text-[#A8FF60] transition-colors font-pixel text-xs">ABOUT</Link>
              <Link href="#contact" className="text-gray-300 hover:text-[#A8FF60] transition-colors font-pixel text-xs">CONTACT</Link>
              <button
                className="px-4 py-2 cursor-pointer rounded-none bg-[#A8FF60] text-[#181A1B] hover:bg-[#97E651] transition-all duration-300 font-pixel text-xs"
                onClick={handleConnectWallet}
                disabled={isConnected || connecting}
              >
                {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : connecting ? "CONNECTING..." : "CONNECT"}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-[#A8FF60] font-pixel tracking-wider">
              ALL-IN-ONE AI-IP SOLUTIONS
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-3xl mx-auto font-pixel text-sm">
              Empowering creators with decentralized AI tools and intellectual property solutions
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/generate-campaigns">
                <button className="px-8 py-4 rounded-none bg-gradient-to-r from-[#A8FF60] to-[#C0FF8C] text-[#181A1B] hover:from-[#C0FF8C] hover:to-[#A8FF60] transition-all duration-200 font-pixel text-sm animate-pulse">
                  GET STARTED
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 bg-[#232426]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-12 text-[#A8FF60] font-pixel tracking-wider"
          >
            FEATURES
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "EMPOWERING CREATORS",
                description: "Empowering creators collaborations with decentralized AI tools",
                icon: "🤝"
              },
              {
                title: "IP SOLUTIONS",
                description: "Intellectual property solutions for the digital age",
                icon: "📜"
              },
              {
                title: "FINE TUNE MODEL",
                description: "Fine tune model with advanced customization options",
                icon: "🎛️"
              },
              {
                title: "EASY FINETUNING",
                description: "Easily finetune model on your data",
                icon: "🧬"
              },
              {
                title: "ROYALTY DISTRIBUTION",
                description: "Earn royalties for your participation",
                icon: "💸"
              },
              {
                title: "STORY PROTOCOL",
                description: "Implemented via story protocol for secure and transparent transactions",
                icon: "🔐"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="p-6 rounded-none bg-[#1A1C1D] border-2 border-[#A8FF60] hover:bg-[#232426] transition-all duration-300 flex flex-col items-center text-center group"
              >
                <motion.div 
                  className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold mb-2 text-[#A8FF60] font-pixel text-sm tracking-wider">{feature.title}</h3>
                <p className="text-gray-400 font-pixel text-xs leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-16 text-[#A8FF60] font-pixel tracking-wider drop-shadow-[0_0_16px_#A8FF60]"
          >
            HOW IT WORKS
          </motion.h2>
          <div className="flex flex-col gap-20">
            {/* Influencer Box */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="relative w-full bg-gradient-to-br from-[#232426] via-[#1A1C1D] to-[#232426] border-2 border-[#A8FF60] rounded-2xl px-10 py-12 flex flex-col items-center shadow-2xl mx-auto overflow-hidden group"
              style={{minHeight:'240px'}}
            >
              {/* Pixel border effect */}
              <span className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-[#A8FF60] opacity-30 blur-[2px] animate-pulse" />
              {/* Floating icon */}
              <motion.div 
                className="absolute -top-8 left-1/2 -translate-x-1/2 z-10"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7 }}
              >
                <span className="inline-block text-5xl md:text-6xl drop-shadow-[0_0_16px_#A8FF60]"></span>
              </motion.div>
              <span className="font-pixel text-2xl text-[#A8FF60] mb-8 mt-8 tracking-widest drop-shadow-[0_0_8px_#A8FF60]">INFLUENCER</span>
              <ol className="font-pixel text-white text-lg md:text-xl space-y-4 w-full max-w-2xl">
                {[
                  "Connect wallet using Tomo Wallet",
                  "Fill up the form",
                  "Train the model",
                  "Model gets automatically listed"
                ].map((step, idx) => (
                  <li key={idx} className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#A8FF60] text-[#181A1B] font-bold text-lg shadow-md border-2 border-[#C0FF8C] mr-2 animate-glow-step">{idx+1}</span>
                    <span className="font-pixel text-base md:text-lg text-gray-100">{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
            {/* Community Box */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative w-full bg-gradient-to-br from-[#232426] via-[#1A1C1D] to-[#232426] border-2 border-[#A8FF60] rounded-2xl px-10 py-12 flex flex-col items-center shadow-2xl mx-auto overflow-hidden group"
              style={{minHeight:'240px'}}
            >
              {/* Pixel border effect */}
              <span className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-[#A8FF60] opacity-30 blur-[2px] animate-pulse" />
              {/* Floating icon */}
              <motion.div 
                className="absolute -top-8 left-1/2 -translate-x-1/2 z-10"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7 }}
              >
                <span className="inline-block text-5xl md:text-6xl drop-shadow-[0_0_16px_#A8FF60]"></span>
              </motion.div>
              <span className="font-pixel text-2xl text-[#A8FF60] mb-8 mt-8 tracking-widest drop-shadow-[0_0_8px_#A8FF60]">COMMUNITY</span>
              <ol className="font-pixel text-white text-lg md:text-xl space-y-4 w-full max-w-2xl">
                {[
                  "Connect wallet using Tomo Wallet",
                  "Fill up the form",
                  "Generate campaigns",
                  "Mint IP"
                ].map((step, idx) => (
                  <li key={idx} className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#A8FF60] text-[#181A1B] font-bold text-lg shadow-md border-2 border-[#C0FF8C] mr-2 animate-glow-step">{idx+1}</span>
                    <span className="font-pixel text-base md:text-lg text-gray-100">{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-20 bg-[#232426]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 text-[#A8FF60] font-pixel tracking-wider">ABOUT MEDLO</h2>
            <p className="text-gray-400 font-pixel text-sm max-w-3xl mx-auto">
            Medlo enables users and communities to co-create NFTs with influencers. It sets on-chain royalties and offers perks like access to gated communities event access etc. Once finalized, the NFT can be minted with fans in our integrated marketplace. Every new license minted sends royalties to both creator and influencer.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 bg-[#1A1C1D] border-2 border-[#A8FF60]"
            >
              <h3 className="text-xl font-bold mb-4 text-[#A8FF60] font-pixel text-sm">OUR MISSION</h3>
              <p className="text-gray-400 font-pixel text-xs">
                To democratize access to AI technology and empower creators with the tools they need to succeed in the digital age.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 bg-[#1A1C1D] border-2 border-[#A8FF60]"
            >
              <h3 className="text-xl font-bold mb-4 text-[#A8FF60] font-pixel text-sm">OUR VISION</h3>
              <p className="text-gray-400 font-pixel text-xs">
                To create a future where AI technology is accessible, transparent, and beneficial for all creators and innovators.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

     

      {/* Footer */}
      <footer className="relative z-10 bg-[#232426] text-white py-12 border-t border-[#A8FF60]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#A8FF60] font-pixel text-sm">MEDLO</h3>
              <p className="text-gray-400 font-pixel text-xs">Decentralized AI solutions on Story Network</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#A8FF60] font-pixel text-sm">QUICK LINKS</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-400 hover:text-[#A8FF60] transition-colors font-pixel text-xs">FEATURES</Link></li>
                <li><Link href="#about" className="text-gray-400 hover:text-[#A8FF60] transition-colors font-pixel text-xs">ABOUT</Link></li>
                <li><Link href="#contact" className="text-gray-400 hover:text-[#A8FF60] transition-colors font-pixel text-xs">CONTACT</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#A8FF60] font-pixel text-sm">NEWSLETTER</h3>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 rounded-none w-full bg-[#1A1C1D] text-white border border-[#3E4044] focus:outline-none focus:border-[#A8FF60] font-pixel text-xs"
                />
                <button className="px-4 py-2 rounded-none bg-[#A8FF60] text-[#181A1B] hover:bg-[#97E651] transition-colors font-pixel text-xs">
                  SUBSCRIBE
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#3E4044] text-center text-gray-400 font-pixel text-xs">
            <p>&copy; {new Date().getFullYear()} MEDLO. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
