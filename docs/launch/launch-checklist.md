# PoHI Launch Checklist

## Pre-Launch (Now - Endorsement待ち)

- [x] ブログ記事完成 (`docs/blog-introducing-pohi.md`)
- [x] HN 投稿文案 (`docs/launch/hacker-news-post.md`)
- [x] Reddit 投稿文案 (`docs/launch/reddit-posts.md`)
- [x] Gitcoin Passport 検証済み (Score: 54.33)
- [x] セキュリティレビュー (SECURITY.md)
- [x] テストカバレッジ 250+
- [x] OG画像の準備 (動的生成: /opengraph-image, /twitter-image)

---

## Launch Day (Endorsement通過後)

### Step 1: arXiv 公開 (朝)

```bash
# arXiv submission を confirm
# arXiv ID を取得 (例: 2601.xxxxx)
```

### Step 2: README 更新

```bash
# arXiv バッジを追加
# README.md の "coming soon" を実際のリンクに変更
```

```markdown
[![arXiv](https://img.shields.io/badge/arXiv-2601.xxxxx-b31b1b.svg)](https://arxiv.org/abs/2601.xxxxx)
```

### Step 3: ブログ記事の Paper リンク更新

```bash
# docs/blog-introducing-pohi.md の [Paper (coming soon)](#) を更新
```

### Step 4: GitHub Release

```bash
git tag v0.2.0
git push origin v0.2.0
gh release create v0.2.0 --title "v0.2.0 - arXiv Publication" --notes "Paper published on arXiv"
```

### Step 5: dev.to 投稿 (午後)

1. https://dev.to にログイン
2. `docs/blog-introducing-pohi.md` をペースト
3. front matter を追加
4. Paper リンクを arXiv に更新
5. Publish

### Step 6: HN 投稿 (US朝 = 日本深夜)

1. https://news.ycombinator.com/submit
2. Title: `Show HN: PoHI – Cryptographic proof that a human approved your code`
3. URL: `https://github.com/pohi-protocol/pohi`
4. First comment を即座に投稿

### Step 7: Reddit 投稿 (HN の2-4時間後)

1. r/programming (Link post)
2. 2時間後: r/netsec (Self post)
3. さらに2時間後: r/ethereum or r/worldcoin

### Step 8: Twitter/X

```
🔏 Introducing PoHI: Proof of Human Intent

AI writes code. But can you prove a human approved it?

PoHI creates cryptographic attestations binding:
• WHO: World ID ZK proof
• WHAT: Specific commit
• WHEN: On-chain timestamp

Paper: [arXiv]
Demo: https://pohi-demo.vercel.app
GitHub: https://github.com/pohi-protocol/pohi
```

---

## Post-Launch

- [ ] HN/Reddit コメントに返信
- [ ] フィードバックを Issue に記録
- [ ] World ID チームにコンタクト
- [ ] Gitcoin チームにコンタクト

---

## 連絡先テンプレート

### World ID チーム

```
Subject: PoHI - Human approval verification using World ID

Hi World ID team,

I built PoHI (Proof of Human Intent), a protocol that uses World ID to cryptographically verify human approval for software actions like git merges and deploys.

Paper: [arXiv]
Demo: https://pohi-demo.vercel.app
GitHub: https://github.com/pohi-protocol/pohi

Would love to discuss potential collaboration or integration opportunities.

Best,
Ikko Ashimine
```

### Gitcoin チーム

```
Subject: PoHI - Using Gitcoin Passport for developer identity verification

Hi Gitcoin team,

I built PoHI, a protocol for verifying human approval in CI/CD pipelines. We've integrated Gitcoin Passport as an identity provider (tested with score 54.33).

GitHub: https://github.com/pohi-protocol/pohi
Evidence: https://github.com/pohi-protocol/pohi/blob/main/docs/verification-evidence/gitcoin-passport-2025-12.md

Interested in discussing integration or partnership.

Best,
Ikko Ashimine
```
