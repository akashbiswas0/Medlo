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
                title: "ONE-LINE DEPLOYMENT",
                description: "Run any open-source AI model with a single API call",
                icon: "🚀"
              },
              {
                title: "MODEL MARKETPLACE",
                description: "Access thousands of community-built models with no setup",
                icon: "🛍️"
              },
              {
                title: "FINE-TUNING VIA COG",
                description: "Package and deploy custom models effortlessly",
                icon: "⚙️"
              },
              {
                title: "AUTO-SCALING",
                description: "Infrastructure scales automatically on demand",
                icon: "📈"
              },
              {
                title: "VERSIONING",
                description: "Track and reproduce experiments with built-in version control",
                icon: "📝"
              },
              {
                title: "SDK INTEGRATION",
                description: "Seamless integration in existing workflows",
                icon: "💻"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="p-6 rounded-none bg-[#1A1C1D] border-2 border-[#A8FF60] hover:bg-[#232426] transition-all duration-300"
              >
                <motion.div 
                  className="text-4xl mb-4"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold mb-2 text-[#A8FF60] font-pixel text-sm">{feature.title}</h3>
                <p className="text-gray-400 font-pixel text-xs">{feature.description}</p>
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
            className="text-3xl font-bold text-center mb-12 text-[#A8FF60] font-pixel tracking-wider"
          >
            HOW IT WORKS
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "CONNECT WALLET",
                description: "Connect your wallet to access the platform"
              },
              {
                step: "02",
                title: "SELECT MODEL",
                description: "Choose from our curated list of AI models"
              },
              {
                step: "03",
                title: "GENERATE & DEPLOY",
                description: "Generate content and deploy with one click"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative p-6 bg-[#1A1C1D] border-2 border-[#A8FF60]"
              >
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#A8FF60] flex items-center justify-center text-[#181A1B] font-pixel text-xs">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#A8FF60] font-pixel text-sm mt-4">{step.title}</h3>
                <p className="text-gray-400 font-pixel text-xs">{step.description}</p>
              </motion.div>
            ))}
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
              MEDLO is revolutionizing the way creators interact with AI technology. Our platform combines the power of decentralized networks with cutting-edge AI models to provide a seamless, secure, and efficient solution for content generation and intellectual property management.
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

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-12 text-[#A8FF60] font-pixel tracking-wider"
          >
            WHAT OUR USERS SAY
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "MEDLO has transformed how I create content. The AI tools are incredibly powerful and easy to use.",
                author: "Sarah K.",
                role: "Content Creator"
              },
              {
                quote: "The platform's integration with blockchain technology gives me peace of mind about my IP rights.",
                author: "Michael R.",
                role: "Digital Artist"
              },
              {
                quote: "The one-line deployment feature saves me hours of setup time. Highly recommended!",
                author: "David L.",
                role: "Developer"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 bg-[#1A1C1D] border-2 border-[#A8FF60]"
              >
                <p className="text-gray-400 font-pixel text-xs mb-4">"{testimonial.quote}"</p>
                <div className="text-[#A8FF60] font-pixel text-xs">
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
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
