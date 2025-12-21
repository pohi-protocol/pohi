# PoHI GitLab CI Component

Human approval for GitLab CI/CD pipelines using World ID verification.

## Overview

This component adds a human verification step to your GitLab CI/CD pipelines. It requires approval from a verified human (via World ID) before the pipeline can proceed, preventing unauthorized automated deployments.

## Quick Start

### Option 1: Use as GitLab CI Component

Include the component in your `.gitlab-ci.yml`:

```yaml
include:
  - component: gitlab.com/pohi-protocol/pohi/human-approval@main
    inputs:
      approval_url: https://your-approval-server.com
      world_id_app_id: app_xxx
      world_id_action: approve-deploy
```

### Option 2: Use the npm package directly

```yaml
stages:
  - approval
  - deploy

human-approval:
  stage: approval
  image: node:20-alpine
  before_script:
    - npm install -g pohi-gitlab-ci@latest
  script:
    - pohi-gitlab-ci
  variables:
    POHI_APPROVAL_URL: https://your-approval-server.com
    POHI_WORLD_ID_APP_ID: app_xxx
    POHI_WORLD_ID_ACTION: approve-deploy
  artifacts:
    reports:
      dotenv: pohi-approval.env
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

deploy:
  stage: deploy
  needs: [human-approval]
  script:
    - echo "Deploying with attestation: $POHI_ATTESTATION_HASH"
```

## Configuration

### Component Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `approval_url` | Base URL of PoHI approval server | Required |
| `world_id_app_id` | World ID Application ID | Required |
| `world_id_action` | World ID Action identifier | Required |
| `verification_level` | `orb` or `device` | `orb` |
| `timeout_minutes` | Timeout waiting for approval | `30` |
| `poll_interval_seconds` | Polling interval | `10` |
| `stage` | Pipeline stage name | `approval` |

### Environment Variables

When using the npm package directly, set these variables:

| Variable | Description |
|----------|-------------|
| `POHI_APPROVAL_URL` | Base URL of PoHI approval server |
| `POHI_WORLD_ID_APP_ID` | World ID Application ID |
| `POHI_WORLD_ID_ACTION` | World ID Action identifier |
| `POHI_VERIFICATION_LEVEL` | Verification level (optional) |
| `POHI_TIMEOUT_MINUTES` | Timeout in minutes (optional) |
| `POHI_POLL_INTERVAL_SECONDS` | Poll interval (optional) |
| `GITLAB_TOKEN` | Custom token (defaults to `CI_JOB_TOKEN`) |

### GitLab CI Predefined Variables (auto-detected)

- `CI_PROJECT_ID` - Project ID
- `CI_PROJECT_PATH` - Full project path
- `CI_COMMIT_SHA` - Commit hash
- `CI_MERGE_REQUEST_IID` - MR number (in MR pipelines)
- `CI_JOB_TOKEN` - Authentication token
- `CI_API_V4_URL` - GitLab API URL

## How It Works

1. **Pipeline starts** - The approval job creates a pending commit status
2. **MR comment posted** - If in an MR pipeline, a comment with approval link is added
3. **Waiting for approval** - Job polls the approval server
4. **Human verifies** - User scans QR code with World App to approve
5. **Pipeline continues** - On approval, commit status updates and job succeeds
6. **Attestation available** - Output variables available for downstream jobs

## Output Variables

After approval, these variables are available in `pohi-approval.env`:

| Variable | Description |
|----------|-------------|
| `POHI_ATTESTATION` | Full attestation JSON |
| `POHI_ATTESTATION_HASH` | Attestation hash |
| `POHI_NULLIFIER_HASH` | World ID nullifier hash |
| `POHI_APPROVED_AT` | Approval timestamp |

## Token Permissions

The `CI_JOB_TOKEN` requires these permissions:
- `api` - For commit status and MR notes

If using a custom `GITLAB_TOKEN`, ensure it has:
- `api` scope for the project

## Examples

### Production Deployment with Approval

```yaml
stages:
  - build
  - approval
  - deploy

build:
  stage: build
  script:
    - npm run build

human-approval:
  stage: approval
  image: node:20-alpine
  before_script:
    - npm install -g pohi-gitlab-ci@latest
  script:
    - pohi-gitlab-ci
  variables:
    POHI_APPROVAL_URL: $POHI_SERVER_URL
    POHI_WORLD_ID_APP_ID: $WORLD_ID_APP_ID
    POHI_WORLD_ID_ACTION: deploy-production
    POHI_VERIFICATION_LEVEL: orb
  artifacts:
    reports:
      dotenv: pohi-approval.env
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

deploy-production:
  stage: deploy
  needs: [build, human-approval]
  script:
    - echo "Deploying with human attestation"
    - echo "Attestation: $POHI_ATTESTATION_HASH"
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

### MR Approval Gate

```yaml
human-approval:
  stage: approval
  image: node:20-alpine
  before_script:
    - npm install -g pohi-gitlab-ci@latest
  script:
    - pohi-gitlab-ci
  variables:
    POHI_APPROVAL_URL: https://pohi.example.com
    POHI_WORLD_ID_APP_ID: app_staging_xxx
    POHI_WORLD_ID_ACTION: approve-mr
    POHI_VERIFICATION_LEVEL: device
  artifacts:
    reports:
      dotenv: pohi-approval.env
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

## Troubleshooting

### "Failed to create pending status"

Ensure `CI_JOB_TOKEN` has API access. Check project settings:
**Settings > CI/CD > Token Access > CI_JOB_TOKEN permissions**

### "Status check error"

Verify `POHI_APPROVAL_URL` is accessible from GitLab runners.

### Timeout

Increase `POHI_TIMEOUT_MINUTES` or verify the approval URL is correct.

## License

Apache-2.0
