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

| Network | Address |
|---------|---------|
| World Chain Sepolia | TBD |
| World Chain Mainnet | TBD |
