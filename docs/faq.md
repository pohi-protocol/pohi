# Frequently Asked Questions

## General

### What is Proof of Human Intent (PoHI)?

PoHI is a protocol that creates cryptographically verifiable proof that a real human approved a specific software action. It combines:

- **Proof of Personhood** (World ID, Gitcoin Passport, etc.) to verify humanity
- **Cryptographic binding** to link approval to a specific commit
- **Tamper-evident attestations** for audit trails

The protocol answers three critical questions:
1. **Who?** - A unique human (not a bot or duplicate account)
2. **What?** - A specific commit SHA
3. **When?** - An immutable timestamp

### Why do I need PoHI?

As AI agents automate more software development tasks (code generation, PR creation, deployments), there's a growing need to prove human oversight:

- **Compliance**: Regulatory requirements may mandate human approval for critical actions
- **Security**: Prevent fully autonomous AI from deploying malicious code
- **Accountability**: Create audit trails showing who approved what
- **Trust**: Prove to users that humans reviewed AI-generated code

### What problems does PoHI solve?

| Problem | How PoHI Helps |
|---------|----------------|
| AI autonomy concerns | Requires human approval before execution |
| Audit requirements | Creates cryptographic proof of approval |
| Sybil attacks | Uses proof-of-personhood to ensure unique humans |
| Replay attacks | Binds proofs to specific commit SHAs |
| Accountability gaps | Links approvals to verifiable human identities |

---

## World ID

### What is World ID?

World ID is a privacy-preserving proof-of-personhood system developed by Worldcoin. It verifies you're a unique human without revealing your identity using zero-knowledge proofs.

### What are the verification levels?

| Level | Method | Assurance | Use Case |
|-------|--------|-----------|----------|
| **Orb** | Iris biometric | Highest | Production deployments |
| **Device** | Phone-based | Medium | Development, testing |

### Is my biometric data stored?

No. World ID uses zero-knowledge proofs. Your iris scan generates a unique code locally, but the biometric data itself is never stored or transmitted. Only mathematical proofs are used.

### What is a nullifier hash?

A nullifier hash is a unique identifier generated for each human per action. It:
- Proves you're a unique human
- Prevents double-approvals (Sybil resistance)
- Does NOT reveal your identity

### Can I use World ID without an Orb verification?

Yes. Device verification uses your phone and provides a medium level of assurance. However, Orb verification is recommended for high-security workflows.

---

## Privacy & Security

### Is my identity tracked?

No. PoHI uses zero-knowledge proofs:
- Your real identity is never revealed
- Only a nullifier hash is recorded
- The nullifier cannot be linked back to you
- Each action scope generates a different nullifier

### What data is stored in an attestation?

```json
{
  "version": "1.0",
  "type": "HumanApprovalAttestation",
  "subject": {
    "repository": "org/repo",
    "commit_sha": "abc123...",
    "action": "PR_MERGE"
  },
  "human_proof": {
    "method": "world_id",
    "verification_level": "orb",
    "nullifier_hash": "0x..."  // Unique but anonymous
  },
  "timestamp": "2025-01-15T10:30:00Z",
  "attestation_hash": "0x..."
}
```

### Can someone forge an attestation?

No. Attestations are cryptographically secured:
- **Hash integrity**: SHA-256 hash of the attestation prevents tampering
- **Proof binding**: The nullifier is bound to the specific commit SHA
- **On-chain recording**: Optional blockchain recording provides immutability

### What are the security guarantees?

| Property | Mechanism |
|----------|-----------|
| Sybil Resistance | Nullifier hash (one per human per action) |
| Replay Prevention | Signal binding to commit SHA |
| Tamper Evidence | SHA-256 attestation hash |
| Non-repudiation | Zero-knowledge proofs |

---

## Integration

### How do I integrate with GitHub Actions?

1. Create a World ID app at [developer.world.org](https://developer.world.org)
2. Add the PoHI action to your workflow:

```yaml
- name: Request Human Approval
  uses: pohi-protocol/pohi/packages/action@main
  with:
    approval-url: https://pohi-demo.vercel.app
    world-id-app-id: ${{ secrets.WORLD_ID_APP_ID }}
    world-id-action: approve_pr_merge
    verification-level: orb
    timeout-minutes: 30
```

3. Configure branch protection to require the PoHI status check

### Can I use PoHI with GitLab or Bitbucket?

Yes! PoHI supports multiple CI/CD platforms:

- **GitLab CI**: Use the `pohi-gitlab-ci` component
- **Bitbucket Pipelines**: Use the `pohi-bitbucket-pipe` pipe

### How do I test locally?

1. Clone the repository
2. Install dependencies: `npm install`
3. Set mock mode: `POHI_MOCK_PROVIDERS=true`
4. Run the demo: `npm run dev`

Mock mode simulates verification without requiring actual World ID proofs.

---

## Limitations

### What does PoHI NOT guarantee?

PoHI proves human approval, but does NOT guarantee:

1. **Understanding**: The human may not have read the code
2. **Authorization**: The human may not be authorized by your organization
3. **Correctness**: The code may still contain bugs or vulnerabilities
4. **Competence**: The human may lack expertise to evaluate the code

### Should I rely only on PoHI?

No. PoHI is one layer in a defense-in-depth strategy:

- **Combine with code review**: Human review for code quality
- **Use access controls**: Limit who can approve
- **Enable CI/CD checks**: Automated testing and linting
- **Monitor attestations**: Watch for unexpected approvals

### Can AI impersonate a human?

No. The proof-of-personhood verification requires:
- **Orb**: Physical presence at an Orb device
- **Device**: Access to a registered phone with biometric unlock

AI cannot complete these verifications.

---

## Troubleshooting

### "World ID verification failed"

1. Ensure the World App is installed and updated
2. Check your verification level (Orb vs Device)
3. Verify the action ID matches your World ID app configuration
4. Try rescanning the QR code

### "Timeout waiting for approval"

1. Increase `timeout-minutes` in your workflow
2. Check the approval URL is accessible
3. Ensure the approver has the World App ready

### "Duplicate nullifier" error

This means the same human already approved this commit. Each human can only approve each commit once.

### "Invalid signal" error

The signal (commit SHA) doesn't match what was expected. Ensure:
1. The commit SHA is correct
2. No modifications occurred between request and approval

---

## Advanced

### Can I record attestations on-chain?

Yes. PoHI supports on-chain recording on World Chain:

```typescript
import { recordAttestation } from 'pohi-sdk'

await recordAttestation(attestation, {
  chainId: 480, // World Chain
  rpcUrl: 'https://worldchain-mainnet.g.alchemy.com/...'
})
```

### What other PoP providers are supported?

| Provider | Status | Verification Type |
|----------|--------|-------------------|
| World ID | Production | ZK Proofs |
| Gitcoin Passport | Production | Web3 Score |
| BrightID | Beta | Social Graph |
| Civic | Beta | Gateway Pass |
| Proof of Humanity | Beta | Kleros Court |

### Can I add a custom PoP provider?

Yes. Implement the `PoPVerifier` interface:

```typescript
interface PoPVerifier {
  verify(proof: unknown, config: unknown): Promise<VerificationResult>
  toHumanProof(result: VerificationResult, signal: string): HumanProof
}
```

---

## Resources

- [Getting Started Guide](./getting-started.md)
- [Architecture Overview](./architecture.md)
- [Security Documentation](../SECURITY.md)
- [GitHub Repository](https://github.com/pohi-protocol/pohi)
- [Demo Application](https://pohi-demo.vercel.app)
