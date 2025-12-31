# Hacker News Post Draft

## Title (80 chars max)

**Option A** (Show HN):
```
Show HN: PoHI – Cryptographic proof that a human approved your code
```

**Option B** (Paper focus):
```
PoHI: Cryptographically Verifiable Human Approval for AI-Driven Development
```

**Option C** (Problem focus):
```
Show HN: Proving a human (not AI) approved a git commit
```

---

## First Comment (Post immediately after submission)

```
Hi HN, author here.

As AI agents write more code, I kept asking: how do we prove a human actually approved something?

GitHub reviews don't cut it—bots can approve PRs. We needed cryptographic proof.

PoHI binds three things:
- WHO: World ID ZK proof (unique human, privacy-preserving)
- WHAT: Specific commit SHA
- WHEN: On-chain timestamp

The result is a machine-verifiable attestation: "Human X approved commit Y at time Z"

What it does:
- Creates unforgeable proof of human approval
- Works with multiple identity providers (World ID, Gitcoin Passport, etc.)
- Integrates with GitHub Actions, GitLab CI, Bitbucket

What it doesn't do:
- Doesn't verify the human made a good decision
- Doesn't replace code review
- Doesn't provide authorization (use your org's ACLs)

Links:
- Demo: https://pohi-demo.vercel.app
- GitHub: https://github.com/pohi-protocol/pohi
- Paper: [arXiv link]
- Contract: World Chain Sepolia

Built with: TypeScript, Solidity (Foundry), Next.js, World ID

Happy to answer questions about the architecture, security model, or use cases.
```

---

## Timing

Best times to post (in PT, HN's primary timezone):
- **Tuesday-Thursday, 8-10 AM PT** = 水-金 1:00-3:00 AM JST
- Avoid weekends and US holidays

---

## Response Templates

### "Why not just use GPG signing?"

```
GPG proves WHO signed, but not that they're human. A bot with a GPG key can sign commits. World ID's ZK proof guarantees a unique human without revealing identity.
```

### "What if the human doesn't understand what they're approving?"

```
Fair point—this is explicitly out of scope. PoHI proves approval happened, not that it was informed. It's like a notary: proves you signed, not that you read the contract. Semantic verification is a separate (harder) problem.
```

### "Why World ID specifically?"

```
World ID is the primary provider, but PoHI supports multiple identity providers (Gitcoin Passport, BrightID, Civic). Organizations can choose based on their trust requirements. World ID offers the strongest Sybil resistance via biometric verification.
```

### "Isn't this just adding bureaucracy?"

```
It's opt-in for high-stakes actions: production deploys, security releases, sensitive merges. Most PRs don't need this. Think of it as 2FA for git actions—you don't use it everywhere, just where it matters.
```
