# PoHI Demo Application

Proof of Human Intent - Demo implementation using World ID + Next.js

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure World ID

Copy `.env.example` to `.env.local` and fill in your World ID credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_WORLD_ID_APP_ID=app_staging_e4483f0f11660aead49c3e6f2efb3f43
NEXT_PUBLIC_WORLD_ID_ACTION=approve-software-change
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Enter approval details** - Repository, commit SHA, description
2. **Click "Verify with World ID"** - Opens World ID verification
3. **Scan QR with World App** - Proves you're a unique human
4. **Attestation created** - Cryptographic proof of human approval

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── verify/
│   │       └── route.ts    # World ID verification API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx            # Main demo page
└── types/
    └── index.ts            # TypeScript types
```

## World ID Configuration

1. Go to [developer.worldcoin.org](https://developer.worldcoin.org)
2. Create a new App
3. Create an Action (e.g., `approve_code_merge`)
4. Copy App ID and use Action ID in `.env.local`

## Testing

For local testing, use the World ID Simulator:
- Install the World App on your phone
- Use staging credentials (`app_staging_...`)
- The simulator allows testing without Orb verification

## Webhook Notifications

Configure outgoing webhooks to notify external services when attestations are approved.

### Configuration

Add to `.env.local`:

```env
# Webhook endpoint URL
POHI_WEBHOOK_URL=https://your-service.com/webhook

# Secret for HMAC-SHA256 signature (optional but recommended)
POHI_WEBHOOK_SECRET=your_secret_here

# Request timeout in milliseconds (default: 10000)
POHI_WEBHOOK_TIMEOUT_MS=10000
```

### Webhook Payload

```json
{
  "event": "attestation.approved",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "attestation": {
      "version": "1.0",
      "type": "pohi-approval",
      "subject": {
        "repository": "owner/repo",
        "commit_sha": "abc123..."
      },
      "human_proof": {
        "method": "world_id",
        "verification_level": "orb",
        "nullifier_hash": "0x...",
        "signal": "..."
      },
      "timestamp": "2024-01-15T10:30:00.000Z",
      "attestation_hash": "0x..."
    },
    "subject": { "repository": "owner/repo", "commit_sha": "abc123..." },
    "provider": "world_id"
  }
}
```

### Events

| Event | Description |
|-------|-------------|
| `attestation.approved` | Attestation successfully created |
| `verification.failed` | Verification failed |

### Security

When `POHI_WEBHOOK_SECRET` is configured, requests include:
- `X-PoHI-Signature`: HMAC-SHA256 signature (`sha256=...`)
- `X-PoHI-Event`: Event type
- `X-PoHI-Timestamp`: ISO timestamp

Verify signature in your webhook receiver:

```typescript
import { createHmac } from 'crypto'

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`
  return signature === expected
}
```

## Next Steps

- [ ] Add database storage for attestations
- [x] Implement webhook notifications
- [ ] Add signature to attestations
- [ ] Create GitHub Action wrapper

## License

Apache 2.0
