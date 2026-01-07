# Supported Providers

PoHI Protocol supports multiple Proof of Personhood (PoP) providers for human verification. Each provider offers different verification methods and trust levels.

## Overview

| Provider | Method | Trust Level | Best For |
|----------|--------|-------------|----------|
| [World ID](#world-id) | ZK Proofs with Orb/Device | High | Maximum security, unique human verification |
| [Gitcoin Passport](#gitcoin-passport) | Web3 reputation score | Medium-High | Web3 native users with on-chain history |
| [BrightID](#brightid) | Social graph verification | Medium | Communities with social connections |
| [Civic](#civic) | Gateway Pass (KYC) | Medium | Regulated environments |
| [Proof of Humanity](#proof-of-humanity) | Kleros registry | High | Decentralized verification |

---

## World ID

**Worldcoin's privacy-preserving identity protocol using zero-knowledge proofs.**

### Features
- Biometric verification via Orb (iris scan)
- Device-level verification as fallback
- ZK proofs - no personal data exposed
- One-person-one-proof guarantee

### Configuration

```env
NEXT_PUBLIC_WORLD_ID_APP_ID=app_your_app_id
NEXT_PUBLIC_WORLD_ID_ACTION=your_action_name
```

### Verification Levels

| Level | Description | Trust |
|-------|-------------|-------|
| `orb` | Verified via Orb device | Highest |
| `device` | Verified via World App | Medium |

### Usage

```typescript
import { POP_PROVIDERS } from 'pohi-core'

// Frontend: Use IDKit component
<IDKitWidget
  app_id={process.env.NEXT_PUBLIC_WORLD_ID_APP_ID}
  action={process.env.NEXT_PUBLIC_WORLD_ID_ACTION}
  onSuccess={handleVerify}
  verification_level="orb"
/>
```

### Resources
- [World ID Developer Portal](https://developer.worldcoin.org/)
- [IDKit Documentation](https://docs.worldcoin.org/idkit)

---

## Gitcoin Passport

**Web3 identity aggregator that scores users based on on-chain and off-chain credentials.**

### Features
- Aggregates multiple identity stamps
- Configurable minimum score threshold
- No biometric data required
- Sybil resistance through reputation

### Configuration

```env
GITCOIN_PASSPORT_API_KEY=your_api_key
GITCOIN_PASSPORT_SCORER_ID=your_scorer_id
GITCOIN_PASSPORT_MIN_SCORE=20
```

### Verification Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| `high_trust` | >= 35 | Highly trusted identity |
| `trusted` | >= 25 | Trusted identity |
| `basic` | >= 15 | Basic verification |

### Usage

```typescript
import { GitcoinPassportVerifier } from 'pohi-core'

const verifier = new GitcoinPassportVerifier()
const result = await verifier.verify(
  { address: '0x...', score: 0, score_timestamp: '' },
  {
    api_key: process.env.GITCOIN_PASSPORT_API_KEY,
    scorer_id: process.env.GITCOIN_PASSPORT_SCORER_ID,
    min_score: 20
  }
)
```

### Resources
- [Gitcoin Passport](https://passport.gitcoin.co/)
- [Passport API Docs](https://docs.passport.gitcoin.co/)

---

## BrightID

**Decentralized social identity network that verifies uniqueness through social connections.**

### Features
- Social graph-based verification
- No biometric data required
- Community-driven trust
- Open source and decentralized

### Configuration

```env
BRIGHTID_CONTEXT=pohi
BRIGHTID_NODE_URL=https://app.brightid.org/node/v5
NEXT_PUBLIC_BRIGHTID_CONTEXT=pohi
NEXT_PUBLIC_BRIGHTID_NODE_URL=https://app.brightid.org/node/v5
```

### Verification Flow

1. User generates a unique context ID
2. User links their BrightID via deep link
3. Backend verifies uniqueness via BrightID node

### Usage

```typescript
import { BrightIDVerifier } from 'pohi-core'

const verifier = new BrightIDVerifier()
const result = await verifier.verify(
  { context_id: 'user_context_id', unique: false, timestamp: 0, sig: null },
  { context: 'pohi', node_url: 'https://app.brightid.org/node/v5' }
)
```

### Deep Link Format

```
brightid://link-verification/{context}/{context_id}
```

### Resources
- [BrightID](https://www.brightid.org/)
- [BrightID Developer Docs](https://brightid.gitbook.io/)

---

## Civic

**Gateway Pass system for identity verification using various KYC methods.**

### Features
- Multiple verification types (captcha, uniqueness, liveness, ID)
- Configurable verification requirements
- On-chain gateway tokens
- Expiration support

### Configuration

```env
CIVIC_GATEKEEPER_NETWORK=ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6
```

### Verification Levels

| Level | Description | Trust |
|-------|-------------|-------|
| `id_verification` | Full ID verification | Highest |
| `liveness` | Liveness check | High |
| `uniqueness` | Uniqueness verification | Medium |
| `captcha` | Basic captcha | Low |

### Usage

```typescript
import { CivicVerifier } from 'pohi-core'

const verifier = new CivicVerifier()
const result = await verifier.verify(
  {
    user_id: '0x...',
    gateway_token: 'token_if_available',
    verifications: ['uniqueness', 'liveness'],
    expiration: '2025-12-31T00:00:00Z'
  },
  {
    gatekeeper_network: 'ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6',
    required_verifications: ['uniqueness']
  }
)
```

### Resources
- [Civic](https://www.civic.com/)
- [Civic Docs](https://docs.civic.com/)

---

## Proof of Humanity

**Kleros-curated registry of verified humans using video verification and social vouching.**

### Features
- Decentralized curation via Kleros
- Video submission for verification
- Social vouching system
- On-chain registry

### Configuration

```env
POH_SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/kleros/proof-of-humanity-mainnet
```

### Verification Statuses

| Status | Description | Accepted |
|--------|-------------|----------|
| `registered` | Fully registered human | Yes |
| `vouching` | Collecting vouches | No |
| `pending` | Pending registration/removal | No |
| `challenged` | Under dispute | No |
| `removed` | Removed from registry | No |

### Usage

```typescript
import { ProofOfHumanityVerifier } from 'pohi-core'

const verifier = new ProofOfHumanityVerifier()
const result = await verifier.verify(
  { address: '0x...', status: 'registered' },
  { subgraph_url: 'https://api.thegraph.com/subgraphs/name/kleros/proof-of-humanity-mainnet' }
)
```

### Resources
- [Proof of Humanity](https://proofofhumanity.id/)
- [PoH Registry](https://app.proofofhumanity.id/)

---

## Adding a New Provider

To add support for a new PoP provider:

1. **Define types** in `packages/core/src/providers.ts`
2. **Implement verifier** in `packages/core/src/verification/`
3. **Register verifier** using `registerVerifier()`
4. **Add UI component** in `packages/demo/src/components/verification/`
5. **Add configuration** in `packages/demo/src/lib/provider-config.ts`
6. **Update ProviderSelector** to include the new provider
7. **Write tests** in `packages/core/src/verification/verification.test.ts`

### Verifier Interface

```typescript
interface ProviderVerifier<TProof, TConfig> {
  readonly provider: string
  verify(proof: TProof, config: TConfig): Promise<VerificationResult>
  toHumanProof(result: VerificationResult, signal: string): HumanProof
}
```

---

## Mock Mode

For development and testing, enable mock mode:

```env
POHI_MOCK_PROVIDERS=true
```

In mock mode, all providers return successful verification without calling external APIs.
