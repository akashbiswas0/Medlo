import { getDefaultConfig } from '@tomo-inc/tomo-evm-kit';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { metaMaskWallet, rainbowWallet, walletConnectWallet } from '@tomo-inc/tomo-evm-kit/wallets';
import { aeneid } from '@story-protocol/core-sdk';

export const config = getDefaultConfig({
  clientId: 'XXXXXXXXXXXXXXXXXXXXXXX', // Replace with your actual clientId from Tomo Dashboard
  appName: 'Medlo',
  projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect projectId
  chains: [aeneid, mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
  wallets: [
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet, 
        rainbowWallet, 
        walletConnectWallet,
      ],
    },
  ],
}); 