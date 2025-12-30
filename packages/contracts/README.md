# @pohi-protocol/contracts

Smart contracts for Proof of Human Intent on World Chain.

## Prerequisites

Install [Foundry](https://book.getfoundry.sh/getting-started/installation):

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Setup

```bash
cd packages/contracts
forge install
```

## Build

```bash
forge build
```

## Test

```bash
forge test
```

## Deploy

### Sepolia (Testnet)

```bash
export PRIVATE_KEY=your_private_key
export WORLDSCAN_API_KEY=your_api_key
npm run deploy:sepolia
```

### Mainnet

```bash
export PRIVATE_KEY=your_private_key
export WORLD_CHAIN_RPC_URL=your_rpc_url
export WORLDSCAN_API_KEY=your_api_key
npm run deploy:mainnet
```

## Contract Addresses

| Network | Address | Explorer |
|---------|---------|----------|
| World Chain Sepolia | `0xe3aF97c1Eb0c1Bfa872059270a947e8A10FFD9d1` | [View](https://worldchain-sepolia.explorer.alchemy.com/address/0xe3af97c1eb0c1bfa872059270a947e8a10ffd9d1) |
| World Chain Mainnet | TBD | - |
