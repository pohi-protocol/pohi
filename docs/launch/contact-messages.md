# Contact Messages

## World ID Team

### 連絡先
- Discord: https://discord.gg/worldcoin
- Twitter/X: @worldaborgs
- Developer: https://world.org/developers

### メッセージ (Discord/Email)

```
Subject: PoHI - Using World ID to verify human approval for CI/CD pipelines

Hi World ID team,

I'm Ikko Ashimine, a developer building PoHI (Proof of Human Intent).

PoHI uses World ID to create cryptographic proof that a human approved software actions like git merges and production deploys. As AI agents increasingly write and review code, this provides verifiable evidence of human oversight.

How it works:
- Signal = SHA256(repository + commit_sha) - binds proof to specific action
- Nullifier ensures one approval per human per commit
- Attestation stored on-chain (World Chain) or in SCITT log

Current status:
- Demo live: https://pohi-demo.vercel.app
- Smart contract deployed on World Chain Sepolia
- npm packages published (pohi-core, pohi-sdk)
- GitHub Action, GitLab CI, Bitbucket Pipe integrations ready
- Paper in preparation for arXiv

Links:
- GitHub: https://github.com/pohi-protocol/pohi
- Contract: https://worldchain-sepolia.explorer.alchemy.com/address/0xe3af97c1eb0c1bfa872059270a947e8a10ffd9d1
- Security review: https://github.com/pohi-protocol/pohi/blob/main/SECURITY.md

I'd love to:
1. Get feedback on the integration approach
2. Discuss potential partnership or listing in World ID ecosystem
3. Coordinate on mainnet deployment

Happy to demo or answer any questions.

Best regards,
Ikko Eltociear Ashimine
GitHub: https://github.com/eltociear
```

---

## Gitcoin Team

### 連絡先
- Discord: https://discord.gg/gitcoin
- Twitter/X: @gitaborgspassport
- Developer: https://developer.passport.xyz/

### メッセージ (Discord/Email)

```
Subject: PoHI - Gitcoin Passport integration for developer identity verification

Hi Gitcoin Passport team,

I'm Ikko Ashimine, building PoHI (Proof of Human Intent) - a protocol for cryptographically verifying human approval in software development workflows.

We've integrated Gitcoin Passport as one of our identity providers, and I wanted to share our successful verification test.

Test Results (December 2025):
- Address: 0x839395e20bbb182fa440d08f850e6c7a8f6f0780
- Score: 54.33 (HIGH_TRUST level)
- Threshold: 20.00
- 18 stamps verified
- API: v2 (stamps/{scorer_id}/score/{address})

Full evidence: https://github.com/pohi-protocol/pohi/blob/main/docs/verification-evidence/gitcoin-passport-2025-12.md

How PoHI uses Gitcoin Passport:
- Score-based verification levels (HIGH_TRUST >= 35, TRUSTED >= 25, BASIC >= 15)
- Alternative to World ID for organizations preferring Web3 identity
- Integrated into CI/CD pipelines (GitHub Actions, GitLab, Bitbucket)

Use case:
As AI agents write more code, PoHI ensures human approval is cryptographically verifiable. Gitcoin Passport provides a Web3-native way to prove identity without biometrics.

Links:
- GitHub: https://github.com/pohi-protocol/pohi
- Demo: https://pohi-demo.vercel.app
- npm: https://www.npmjs.com/package/pohi-core

Would love to:
1. Get feedback on our Passport integration
2. Explore potential ecosystem listing or partnership
3. Discuss best practices for score thresholds

Thank you for building Gitcoin Passport - it's a great addition to the identity provider ecosystem.

Best regards,
Ikko Eltociear Ashimine
GitHub: https://github.com/eltociear
```

---

## Twitter/X DM (短縮版)

### World ID

```
Hi @worldcoin team! 👋

Built PoHI - uses World ID to prove a human approved git commits/deploys.

Demo: pohi-demo.vercel.app
GitHub: github.com/pohi-protocol/pohi
Contract: World Chain Sepolia

Would love to chat about ecosystem integration!
```

### Gitcoin Passport

```
Hi @gitcoinpassport team! 👋

Integrated Gitcoin Passport into PoHI for verifying human approval in CI/CD.

Tested successfully - Score 54.33 (HIGH_TRUST)

GitHub: github.com/pohi-protocol/pohi
Evidence: github.com/pohi-protocol/pohi/blob/main/docs/verification-evidence/gitcoin-passport-2025-12.md

Would love feedback!
```

---

## 送信タイミング

| タイミング | アクション |
|-----------|-----------|
| **今すぐ** | Discord に参加して自己紹介 |
| **endorsement 後** | 正式な連絡（arXiv リンク付き） |
| **HN/Reddit 後** | フォローアップ（反響を共有） |

## 推奨アプローチ

1. **まず Discord に参加**
   - World ID Discord: 開発者チャンネルで質問
   - Gitcoin Discord: Passport チャンネルで共有

2. **軽く紹介**
   - 「こういうの作ってます」程度
   - 押し売り感を出さない

3. **arXiv 後に正式連絡**
   - 論文リンク付きで信頼性UP
