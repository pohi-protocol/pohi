# @pohi-protocol/action

GitHub Action for PoHI human approval verification.

## Usage

```yaml
name: Require Human Approval

on:
  pull_request:
    types: [labeled]

jobs:
  verify:
    if: github.event.label.name == 'ready-to-merge'
    runs-on: ubuntu-latest
    steps:
      - uses: pohi-protocol/action@v1
        with:
          world-id-app: ${{ secrets.WORLD_ID_APP_ID }}
          required-level: orb
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `world-id-app` | World ID App ID | Yes | - |
| `required-level` | Minimum verification level (`device` or `orb`) | No | `device` |
| `timeout` | Timeout in seconds for approval | No | `300` |

## Outputs

| Output | Description |
|--------|-------------|
| `attestation` | JSON attestation data |
| `attestation-hash` | SHA-256 hash of the attestation |

## How It Works

1. Action creates approval request for the PR/commit
2. Displays World ID QR code in PR comment
3. Waits for human verification via World App
4. Records attestation and updates PR status

## License

MIT
