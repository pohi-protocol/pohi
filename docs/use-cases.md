# PoHI Use Cases

This guide covers practical use cases for Proof of Human Intent in software development workflows.

---

## 1. AI-Generated PR Approval

### Problem

AI coding assistants (GitHub Copilot, Claude, Cursor, etc.) can generate and submit pull requests automatically. Without human verification, malicious or buggy AI-generated code could be merged.

### Solution

Require PoHI verification before merging any AI-generated PR.

### Implementation

```yaml
# .github/workflows/ai-pr-approval.yml
name: AI PR Approval Required

on:
  pull_request:
    types: [opened, synchronize, labeled]

jobs:
  check-ai-pr:
    runs-on: ubuntu-latest
    # Only run if PR has 'ai-generated' label or author is a bot
    if: |
      contains(github.event.pull_request.labels.*.name, 'ai-generated') ||
      github.event.pull_request.user.type == 'Bot'

    steps:
      - name: Request Human Approval
        uses: pohi-protocol/pohi/packages/action@main
        with:
          approval-url: https://pohi-demo.vercel.app
          world-id-app-id: ${{ secrets.WORLD_ID_APP_ID }}
          world-id-action: approve_ai_pr
          verification-level: orb
          timeout-minutes: 60

      - name: PR Approved
        run: echo "Human has verified and approved this AI-generated PR"
```

### Workflow

1. AI assistant creates PR with `ai-generated` label
2. GitHub Action triggers PoHI verification
3. Bot comments on PR with approval link/QR code
4. Human reviews code and scans QR with World App
5. Upon verification, PR status check passes
6. PR can be merged

### Best Practices

- Auto-label AI-generated PRs using GitHub Apps or commit signatures
- Set verification level to `orb` for production code
- Combine with code review requirements

---

## 2. Production Deployment Gate

### Problem

Automated deployments can push changes to production without human oversight. This is risky for:
- Breaking changes
- Security vulnerabilities
- Compliance requirements

### Solution

Gate production deployments with PoHI verification.

### Implementation

```yaml
# .github/workflows/deploy-production.yml
name: Production Deployment

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: npm run build
      - name: Test
        run: npm test
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/

  human-approval:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Request Deployment Approval
        uses: pohi-protocol/pohi/packages/action@main
        with:
          approval-url: https://your-company.com/pohi-approve
          world-id-app-id: ${{ secrets.WORLD_ID_APP_ID }}
          world-id-action: approve_production_deploy
          verification-level: orb
          timeout-minutes: 30

  deploy:
    needs: human-approval
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/
      - name: Deploy to production
        run: ./deploy.sh production
```

### Environment Protection

Combine with GitHub Environment protection rules:
1. Go to Settings > Environments > production
2. Add required reviewers (for secondary approval)
3. Enable "Required status checks" including PoHI

---

## 3. Release Signing

### Problem

Software releases need verifiable proof of human authorization for:
- Security audits
- Compliance (SOC 2, ISO 27001)
- Supply chain integrity

### Solution

Attach PoHI attestation to every release.

### Implementation

```yaml
# .github/workflows/release.yml
name: Release with Human Attestation

on:
  push:
    tags:
      - 'v*'

jobs:
  build-and-sign:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build release
        run: |
          npm ci
          npm run build
          tar -czvf release-${{ github.ref_name }}.tar.gz dist/

      - name: Request Release Approval
        id: pohi
        uses: pohi-protocol/pohi/packages/action@main
        with:
          approval-url: https://pohi-demo.vercel.app
          world-id-app-id: ${{ secrets.WORLD_ID_APP_ID }}
          world-id-action: approve_release
          verification-level: orb
          timeout-minutes: 120

      - name: Save attestation
        run: |
          echo '${{ steps.pohi.outputs.attestation }}' > attestation.json

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            release-${{ github.ref_name }}.tar.gz
            attestation.json
          body: |
            ## Release ${{ github.ref_name }}

            ### Human Attestation
            This release was approved by a verified human.
            - Attestation Hash: `${{ steps.pohi.outputs.attestation-hash }}`
            - Approved At: ${{ steps.pohi.outputs.approved-at }}

            [Verify attestation](https://pohi-demo.vercel.app/verify?hash=${{ steps.pohi.outputs.attestation-hash }})
```

### Verification

Users can verify the release attestation:

```bash
# Download and verify attestation
curl -sL https://github.com/org/repo/releases/download/v1.0.0/attestation.json | \
  npx pohi-cli verify
```

---

## 4. Critical Configuration Changes

### Problem

Changes to critical configurations (IAM policies, secrets, infrastructure) should require human approval.

### Solution

Gate configuration changes with PoHI, triggered by file path patterns.

### Implementation

```yaml
# .github/workflows/config-approval.yml
name: Critical Config Approval

on:
  pull_request:
    paths:
      - 'terraform/**'
      - '.github/workflows/**'
      - 'k8s/**'
      - '.env.example'
      - 'config/production.yml'

jobs:
  require-approval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Detect critical changes
        id: changes
        run: |
          echo "Changed critical files:"
          git diff --name-only ${{ github.event.pull_request.base.sha }} ${{ github.sha }} | \
            grep -E '(terraform/|.github/workflows/|k8s/|\.env|config/production)' || true

      - name: Request Security Approval
        uses: pohi-protocol/pohi/packages/action@main
        with:
          approval-url: https://pohi-demo.vercel.app
          world-id-app-id: ${{ secrets.WORLD_ID_APP_ID }}
          world-id-action: approve_critical_config
          verification-level: orb
          timeout-minutes: 30
```

---

## 5. Scheduled Task Authorization

### Problem

Cron jobs and scheduled tasks run automatically. There's no proof that a human authorized them.

### Solution

Require periodic re-authorization for scheduled tasks.

### Implementation

```yaml
# .github/workflows/scheduled-maintenance.yml
name: Weekly Maintenance

on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday at 2am
  workflow_dispatch:

jobs:
  authorize:
    runs-on: ubuntu-latest
    steps:
      - name: Check last authorization
        id: check
        run: |
          # Check if authorization is still valid (e.g., within 7 days)
          LAST_AUTH=$(gh api repos/${{ github.repository }}/actions/variables/LAST_MAINTENANCE_AUTH -q .value 2>/dev/null || echo "0")
          NOW=$(date +%s)
          DIFF=$((NOW - LAST_AUTH))
          if [ $DIFF -gt 604800 ]; then
            echo "needs_auth=true" >> $GITHUB_OUTPUT
          else
            echo "needs_auth=false" >> $GITHUB_OUTPUT
          fi
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Request Authorization
        if: steps.check.outputs.needs_auth == 'true'
        uses: pohi-protocol/pohi/packages/action@main
        with:
          approval-url: https://pohi-demo.vercel.app
          world-id-app-id: ${{ secrets.WORLD_ID_APP_ID }}
          world-id-action: authorize_maintenance
          verification-level: device
          timeout-minutes: 60

      - name: Update authorization timestamp
        if: steps.check.outputs.needs_auth == 'true'
        run: |
          gh api repos/${{ github.repository }}/actions/variables/LAST_MAINTENANCE_AUTH \
            -X PATCH -f value="$(date +%s)"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  maintenance:
    needs: authorize
    runs-on: ubuntu-latest
    steps:
      - name: Run maintenance
        run: |
          echo "Running authorized maintenance tasks..."
          # Your maintenance commands here
```

---

## 6. Multi-Party Approval (M-of-N)

### Problem

High-risk actions may require approval from multiple humans.

### Solution

Combine multiple PoHI verifications with different nullifiers.

### Implementation

```yaml
# .github/workflows/multi-approval.yml
name: Multi-Party Approval

on:
  workflow_dispatch:
    inputs:
      action:
        description: 'Action to approve'
        required: true

jobs:
  first-approval:
    runs-on: ubuntu-latest
    outputs:
      first-nullifier: ${{ steps.first.outputs.nullifier-hash }}
    steps:
      - name: First Approver
        id: first
        uses: pohi-protocol/pohi/packages/action@main
        with:
          approval-url: https://pohi-demo.vercel.app?approver=1
          world-id-app-id: ${{ secrets.WORLD_ID_APP_ID }}
          world-id-action: multi_approve_first
          verification-level: orb
          timeout-minutes: 60

  second-approval:
    needs: first-approval
    runs-on: ubuntu-latest
    steps:
      - name: Second Approver
        id: second
        uses: pohi-protocol/pohi/packages/action@main
        with:
          approval-url: https://pohi-demo.vercel.app?approver=2
          world-id-app-id: ${{ secrets.WORLD_ID_APP_ID }}
          world-id-action: multi_approve_second
          verification-level: orb
          timeout-minutes: 60

      - name: Verify Different Humans
        run: |
          if [ "${{ needs.first-approval.outputs.first-nullifier }}" == "${{ steps.second.outputs.nullifier-hash }}" ]; then
            echo "ERROR: Same person cannot approve twice"
            exit 1
          fi
          echo "Two different humans have approved"

  execute:
    needs: [first-approval, second-approval]
    runs-on: ubuntu-latest
    steps:
      - name: Execute approved action
        run: echo "Executing ${{ github.event.inputs.action }} with multi-party approval"
```

---

## 7. Audit Trail for Compliance

### Problem

Compliance frameworks (SOC 2, ISO 27001, HIPAA) require audit trails of human approvals.

### Solution

Record all PoHI attestations to a centralized log.

### Implementation

```typescript
// audit-logger.ts
import { HumanApprovalAttestation } from 'pohi-core'

interface AuditEntry {
  timestamp: string
  attestation: HumanApprovalAttestation
  repository: string
  action: string
  environment: string
}

async function logAttestation(attestation: HumanApprovalAttestation) {
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    attestation,
    repository: attestation.subject.repository,
    action: attestation.subject.action,
    environment: process.env.ENVIRONMENT || 'unknown',
  }

  // Log to your compliance system
  await fetch('https://compliance.your-company.com/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  })

  // Optionally record on-chain for immutability
  if (process.env.RECORD_ONCHAIN === 'true') {
    const { recordAttestation } = await import('pohi-sdk')
    await recordAttestation(attestation, {
      chainId: 480,
      rpcUrl: process.env.WORLD_CHAIN_RPC!,
    })
  }
}
```

---

## Summary

| Use Case | Verification Level | Timeout | Key Benefit |
|----------|-------------------|---------|-------------|
| AI-Generated PRs | Orb | 60 min | Prevent autonomous AI merges |
| Production Deploy | Orb | 30 min | Gate critical deployments |
| Release Signing | Orb | 120 min | Verifiable supply chain |
| Critical Config | Orb | 30 min | Protect sensitive changes |
| Scheduled Tasks | Device | 60 min | Periodic re-authorization |
| Multi-Party | Orb | 60 min | Separation of duties |
| Audit Trail | Any | N/A | Compliance documentation |

---

## Next Steps

- [Getting Started](./getting-started.md) - Quick integration guide
- [FAQ](./faq.md) - Common questions
- [Security](../SECURITY.md) - Threat model and mitigations
