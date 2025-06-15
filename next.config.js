/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  transpilePackages: [
    '@tomo-inc/tomo-evm-kit',
    '@tomo-wallet/uikit-lite',
    '@tomo-inc/shared-type'
  ],
};

module.exports = nextConfig; 