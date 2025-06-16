import { custom, WalletClient } from 'viem';
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';

export async function getStoryClient(wallet: WalletClient): Promise<StoryClient> {
  const config: StoryConfig = {
    wallet: wallet as any,
    transport: custom(wallet.transport),
    chainId: (wallet.chain?.id ?? 1315) as any,
  } as any;

  return StoryClient.newClient(config);
} 