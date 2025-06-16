/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  transpilePackages: [
    '@tomo-inc/tomo-evm-kit',
    '@tomo-wallet/uikit-lite',
    '@tomo-inc/shared-type'
  ],
  webpack: (config, { dev, isServer }) => {
    // Add externals to prevent server-side issues
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Ignore problematic worker files during build
    config.plugins.push(
      new (require('webpack')).IgnorePlugin({
        resourceRegExp: /HeartbeatWorker/,
      })
    );

    // Add Node.js polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
      buffer: false,
    };

    return config;
  },
};

module.exports = nextConfig; 