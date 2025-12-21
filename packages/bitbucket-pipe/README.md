# PoHI Bitbucket Pipe

Human approval for Bitbucket Pipelines using World ID verification.

## Overview

This pipe adds a human verification step to your Bitbucket Pipelines. It requires approval from a verified human (via World ID) before the pipeline can proceed, preventing unauthorized automated deployments.

## Quick Start

Add the pipe to your `bitbucket-pipelines.yml`:

```yaml
pipelines:
  default:
    - step:
        name: Build
        script:
          - npm run build

    - step:
        name: Human Approval
        script:
          - pipe: docker://pohi-protocol/pohi-approval:latest
            variables:
              POHI_APPROVAL_URL: 'https://your-approval-server.com'
              POHI_WORLD_ID_APP_ID: 'app_xxx'
              POHI_WORLD_ID_ACTION: 'approve-deploy'
              BITBUCKET_TOKEN: $BITBUCKET_TOKEN
        artifacts:
          - pohi-approval.env

    - step:
        name: Deploy
        script:
          - source pohi-approval.env
          - echo "Deploying with attestation: $POHI_ATTESTATION_HASH"
```

## Configuration

### Required Variables

| Variable | Description |
|----------|-------------|
| `POHI_APPROVAL_URL` | Base URL of PoHI approval server |
| `POHI_WORLD_ID_APP_ID` | World ID Application ID |
| `POHI_WORLD_ID_ACTION` | World ID Action identifier |
| `BITBUCKET_TOKEN` | Bitbucket API token (App Password) |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POHI_VERIFICATION_LEVEL` | `orb` | Verification level: `orb` or `device` |
| `POHI_TIMEOUT_MINUTES` | `30` | Timeout waiting for approval |
| `POHI_POLL_INTERVAL_SECONDS` | `10` | Polling interval |

### Bitbucket Predefined Variables (auto-detected)

- `BITBUCKET_WORKSPACE` - Workspace name
- `BITBUCKET_REPO_SLUG` - Repository slug
- `BITBUCKET_COMMIT` - Commit hash
- `BITBUCKET_PR_ID` - PR ID (in PR pipelines)

## Creating a Bitbucket App Password

1. Go to **Personal settings** > **App passwords**
2. Click **Create app password**
3. Give it a label (e.g., "PoHI Approval")
4. Select these permissions:
   - `repository:read`
   - `repository:write`
   - `pullrequest:read`
   - `pullrequest:write`
5. Click **Create**
6. Copy the generated password
7. Add it as a repository variable named `BITBUCKET_TOKEN` in **Repository settings** > **Pipelines** > **Repository variables**

## How It Works

1. **Pipeline starts** - The approval step creates a pending build status
2. **PR comment posted** - If in a PR pipeline, a comment with approval link is added
3. **Waiting for approval** - Pipe polls the approval server
4. **Human verifies** - User scans QR code with World App to approve
5. **Pipeline continues** - On approval, build status updates and step succeeds
6. **Attestation available** - Output variables available for downstream steps

## Output Variables

After approval, these variables are written to `pohi-approval.env`:

| Variable | Description |
|----------|-------------|
| `POHI_ATTESTATION` | Full attestation JSON |
| `POHI_ATTESTATION_HASH` | Attestation hash |
| `POHI_NULLIFIER_HASH` | World ID nullifier hash |
| `POHI_APPROVED_AT` | Approval timestamp |

Use `source pohi-approval.env` in subsequent steps to access these variables.

## Examples

### Production Deployment with Approval

```yaml
pipelines:
  branches:
    main:
      - step:
          name: Build
          script:
            - npm ci
            - npm run build
          artifacts:
            - dist/**

      - step:
          name: Human Approval
          script:
            - pipe: docker://pohi-protocol/pohi-approval:latest
              variables:
                POHI_APPROVAL_URL: $POHI_SERVER_URL
                POHI_WORLD_ID_APP_ID: $WORLD_ID_APP_ID
                POHI_WORLD_ID_ACTION: 'deploy-production'
                POHI_VERIFICATION_LEVEL: 'orb'
                BITBUCKET_TOKEN: $BITBUCKET_TOKEN
          artifacts:
            - pohi-approval.env

      - step:
          name: Deploy to Production
          deployment: production
          script:
            - source pohi-approval.env
            - echo "Deploying with human attestation"
            - echo "Attestation: $POHI_ATTESTATION_HASH"
            - ./deploy.sh
```

### Pull Request Approval Gate

```yaml
pipelines:
  pull-requests:
    '**':
      - step:
          name: Test
          script:
            - npm test

      - step:
          name: Human Approval
          script:
            - pipe: docker://pohi-protocol/pohi-approval:latest
              variables:
                POHI_APPROVAL_URL: 'https://pohi.example.com'
                POHI_WORLD_ID_APP_ID: 'app_staging_xxx'
                POHI_WORLD_ID_ACTION: 'approve-pr'
                POHI_VERIFICATION_LEVEL: 'device'
                BITBUCKET_TOKEN: $BITBUCKET_TOKEN
          artifacts:
            - pohi-approval.env
```

### Conditional Approval (Manual Trigger)

```yaml
pipelines:
  custom:
    deploy-with-approval:
      - step:
          name: Human Approval
          script:
            - pipe: docker://pohi-protocol/pohi-approval:latest
              variables:
                POHI_APPROVAL_URL: $POHI_SERVER_URL
                POHI_WORLD_ID_APP_ID: $WORLD_ID_APP_ID
                POHI_WORLD_ID_ACTION: 'manual-deploy'
                BITBUCKET_TOKEN: $BITBUCKET_TOKEN
          artifacts:
            - pohi-approval.env

      - step:
          name: Deploy
          script:
            - source pohi-approval.env
            - ./deploy.sh
```

## Troubleshooting

### "Failed to create pending status"

Ensure `BITBUCKET_TOKEN` has the `repository:write` permission.

### "Failed to create PR comment"

Ensure `BITBUCKET_TOKEN` has the `pullrequest:write` permission.

### "Status check error"

Verify `POHI_APPROVAL_URL` is accessible from Bitbucket's runners.

### Timeout

Increase `POHI_TIMEOUT_MINUTES` or verify the approval URL is correct.

## Building the Docker Image

```bash
cd packages/bitbucket-pipe
npm run build
npm run docker:build
npm run docker:push
```

## License

Apache-2.0
