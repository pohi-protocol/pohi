# Reddit Posts Draft

## Target Subreddits

| Subreddit | Subscribers | Focus | Post Type |
|-----------|-------------|-------|-----------|
| r/programming | 6M+ | General dev | Link post |
| r/netsec | 500K+ | Security | Self post |
| r/ethereum | 2M+ | Web3/Crypto | Self post |
| r/worldcoin | 20K+ | World ID | Self post |
| r/opensource | 200K+ | OSS projects | Link post |

---

## r/programming

### Title
```
PoHI: Cryptographic proof that a human (not AI) approved a git commit
```

### Link
```
https://github.com/pohi-protocol/pohi
```

### Comment (post immediately)
```
Author here. As AI writes more code, I wanted a way to cryptographically prove human approval.

TL;DR: World ID (ZK proof of personhood) + commit SHA + timestamp = verifiable attestation

- Demo: https://pohi-demo.vercel.app
- Paper: [arXiv]

Happy to discuss the architecture or answer questions.
```

---

## r/netsec

### Title
```
PoHI: Using Zero-Knowledge Proofs to Verify Human Approval in CI/CD Pipelines
```

### Body (self post)
```
I've been working on a protocol to cryptographically verify that a human—not an AI or bot—approved critical software actions.

**Problem**: GitHub reviews can be automated. There's no machine-verifiable proof that a human approved a merge or deploy.

**Solution**: PoHI (Proof of Human Intent) creates attestations binding:
1. A ZK proof of personhood (World ID)
2. A specific commit SHA (signal binding)
3. An immutable timestamp (on-chain or SCITT log)

**Security model**:
- Sybil attacks: Prevented by World ID nullifiers (one proof per human per action)
- Replay attacks: Signal includes commit SHA
- Impersonation: ZK proof required

**Explicitly out of scope**:
- Social engineering (human tricked into approving)
- Semantic gap (human doesn't understand what they approved)
- Malicious insiders

**Links**:
- Security review: https://github.com/pohi-protocol/pohi/blob/main/SECURITY.md
- Paper: [arXiv]
- Demo: https://pohi-demo.vercel.app

Looking for feedback on the threat model. What am I missing?
```

---

## r/ethereum (or r/worldcoin)

### Title
```
Built a protocol using World ID to prove human approval for git commits - PoHI
```

### Body
```
Hey everyone,

I built PoHI (Proof of Human Intent) - a protocol that uses World ID's ZK proofs to verify that a real human approved software actions like merges and deploys.

**Why?**
AI agents are writing code and creating PRs. Soon they'll deploy to production. We need cryptographic proof that a human was in the loop.

**How it uses World ID**:
- Signal = SHA256(repository + commit_sha)
- Nullifier ensures one approval per human per commit
- Verification level (Orb/Device) determines trust level

**Stack**:
- Smart contract on World Chain Sepolia
- TypeScript SDK (pohi-core, pohi-sdk)
- GitHub Action for CI/CD integration

**Multi-provider support**:
Also works with Gitcoin Passport (tested, score 54.33), BrightID, and Civic.

**Links**:
- Demo: https://pohi-demo.vercel.app
- Contract: https://worldchain-sepolia.explorer.alchemy.com/address/0xe3af97c1eb0c1bfa872059270a947e8a10ffd9d1
- GitHub: https://github.com/pohi-protocol/pohi

Would love feedback from the World ID community!
```

---

## r/opensource

### Title
```
Show r/opensource: PoHI - Proving human approval in the age of AI agents
```

### Link
```
https://github.com/pohi-protocol/pohi
```

### Comment
```
Author here. PoHI creates cryptographic proof that a human approved a git commit.

As AI agents write more code, this becomes critical for:
- Production deploys
- Security releases
- Sensitive data access

Stack: TypeScript + Solidity, Apache 2.0 license.

Demo: https://pohi-demo.vercel.app
```

---

## Timing

- **r/programming**: Weekday mornings US time
- **r/netsec**: Any weekday (security folks check regularly)
- **r/ethereum**: Avoid major crypto news days
- **r/worldcoin**: Anytime (smaller, engaged community)

---

## Cross-posting Strategy

1. Post to r/programming first (largest audience)
2. Wait 2-4 hours
3. Post to r/netsec (different angle: security focus)
4. Post to r/ethereum or r/worldcoin (Web3 angle)

Don't post all at once—looks spammy.
