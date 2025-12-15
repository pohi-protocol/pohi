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

## Next Steps

- [ ] Add database storage for attestations
- [ ] Implement GitHub webhook integration
- [ ] Add signature to attestations
- [ ] Create GitHub Action wrapper

## License

Apache 2.0
