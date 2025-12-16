import { defineChain } from 'viem'

/**
 * World Chain Mainnet
 * Chain ID: 480
 */
export const worldChain = defineChain({
  id: 480,
  name: 'World Chain',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://worldchain-mainnet.g.alchemy.com/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'WorldScan',
      url: 'https://worldscan.org',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
})

/**
 * World Chain Sepolia (Testnet)
 * Chain ID: 4801
 */
export const worldChainSepolia = defineChain({
  id: 4801,
  name: 'World Chain Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://worldchain-sepolia.g.alchemy.com/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'WorldScan Sepolia',
      url: 'https://sepolia.worldscan.org',
    },
  },
  testnet: true,
})
