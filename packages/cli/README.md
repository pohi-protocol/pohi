# pohi-cli

Command-line tool for Proof of Human Intent (PoHI).

## Installation

```bash
npm install -g pohi-cli
```

## Usage

### Request Human Approval

```bash
pohi request --repo owner/repo --commit abc123
```

This will:
1. Display a World ID QR code
2. Wait for human verification via World App
3. Create and optionally record the attestation

### Verify Attestation

```bash
pohi verify --repo owner/repo --commit abc123
```

### Configuration

```bash
# Set default network
pohi config set network sepolia

# View configuration
pohi config list
```

## Commands

| Command | Description |
|---------|-------------|
| `request` | Request human approval for a commit |
| `verify` | Verify an existing attestation |
| `config` | Manage CLI configuration |

## License

Apache-2.0
