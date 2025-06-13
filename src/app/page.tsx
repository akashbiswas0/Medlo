"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Add Ethereum provider type for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const router = useRouter();

  const handleConnectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("MetaMask is not installed. Please install it to connect your wallet.");
      return;
    }
    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setIsConnected(true);
        router.push("/selection");
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      setIsConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md z-50 border-b border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold">Medlo</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#home" className="hover:text-[#A8FF60] transition-colors">Home</Link>
              <Link href="#features" className="hover:text-[#A8FF60] transition-colors">Features</Link>
              <Link href="#about" className="hover:text-[#A8FF60] transition-colors">About</Link>
              <Link href="#contact" className="hover:text-[#A8FF60] transition-colors">Contact</Link>
              <button
                className="px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-[#A8FF60] hover:text-black transition-all duration-300"
                onClick={handleConnectWallet}
                disabled={isConnected || connecting}
              >
                {isConnected ? "Connected" : connecting ? "Connecting..." : "connect wallet"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              All-in-one AI-IP solutions in one place on Story Network
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Empowering creators with decentralized AI tools and intellectual property solutions
            </p>
            <Link href="/test">
            <button className="px-8 py-4 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-[#A8FF60] hover:text-black transition-all duration-300 text-lg font-semibold animate-pulse">
              Get Started
            </button>
            </Link>
            
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              {
                title: "One-Line Deployment",
                description: "Run any open-source AI model with a single API call",
                icon: "🚀"
              },
              {
                title: "Model Marketplace",
                description: "Access thousands of community-built models with no setup",
                icon: "🛍️"
              },
              {
                title: "Fine-Tuning via Cog",
                description: "Package and deploy custom models effortlessly",
                icon: "⚙️"
              },
              {
                title: "Auto-Scaling & Monitoring",
                description: "Infrastructure scales automatically on demand",
                icon: "📈"
              },
              {
                title: "Versioning & Reproducibility",
                description: "Track and reproduce experiments with built-in version control",
                icon: "📝"
              },
              {
                title: "Python & JS SDKs",
                description: "Seamless integration in existing workflows",
                icon: "💻"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-[#A8FF60]/10 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Medlo</h3>
              <p className="text-gray-400">Decentralized AI solutions on Story Network</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="hover:text-[#A8FF60] transition-colors">Features</Link></li>
                <li><Link href="#about" className="hover:text-[#A8FF60] transition-colors">About</Link></li>
                <li><Link href="#contact" className="hover:text-[#A8FF60] transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Newsletter</h3>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 rounded-l-lg w-full bg-gray-800 text-white"
                />
                <button className="px-4 py-2 rounded-r-lg bg-[#A8FF60] text-black hover:bg-[#A8FF60]/80 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Medlo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
