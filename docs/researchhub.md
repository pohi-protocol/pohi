# Posting PoHI to ResearchHub

> ✅ **Published:** <https://www.researchhub.com/post/32358/proof-of-human-intent-cryptographically-verifiable-human-approval-for-ai-driven-software-development>
> (status: Pending Review — ResearchHub's open peer-review queue; the preprint is publicly visible meanwhile.)

Canonical DOI: **10.5281/zenodo.20729026** — <https://doi.org/10.5281/zenodo.20729026>

ResearchHub requires an authenticated account, so the steps below are manual.
Everything you need to paste is in this file. Kept for re-posting / reference.

## 1. Account

<https://www.researchhub.com/> → **Sign up** (Google, email, or wallet).
Add your **ORCID `0000-0002-3576-6677`** in profile settings so the paper links
to your researcher identity.

## 2. Add the paper

Top nav **＋ (Add)** → **Upload a paper**.

- **Preferred — by DOI:** paste `10.5281/zenodo.20729026`. ResearchHub pulls
  metadata automatically.
  - Note: this is a **Zenodo (DataCite)** DOI. Brand-new DOIs can take a few
    hours/days to appear in ResearchHub's index (OpenAlex). If lookup returns
    nothing, use the manual path below — don't wait.
- **Fallback — manual upload:** upload `paper/main.pdf` and fill the fields from
  §3. Set the source/DOI link to the Zenodo URL.

Then assign **Hubs** (topics) — see §4.

## 3. Metadata (copy-paste)

**Title**
```
Proof of Human Intent: Cryptographically Verifiable Human Approval for AI-Driven Software Development
```

**Authors**: Ikko Eltociear Ashimine (ORCID 0000-0002-3576-6677)

**Abstract**
```
With the rise of autonomous AI agents capable of proposing and executing software changes, traditional human-in-the-loop assumptions no longer hold. As these agents increasingly automate code generation, review, and deployment, the provenance of "human intent" — the accountability behind critical decisions — is becoming obscured. Current systems lack mechanisms to cryptographically verify that a human, rather than an automated process, authorized specific actions such as merging pull requests or deploying to production.

We present Proof of Human Intent (PoHI), a protocol that leverages zero-knowledge proofs of personhood (e.g., World ID) and on-chain transparency logs to create tamper-evident, machine-verifiable records of human approval. The architecture can optionally integrate with decentralized identifiers (DIDs) and verifiable credentials (VCs) for enterprise authorization policies. It addresses three fundamental questions: (1) who approved an action (unique human verification), (2) what was approved (cryptographic binding to specific commits), and (3) when it was approved (immutable timestamping).

We implement a proof-of-concept integration with GitHub Actions and demonstrate that PoHI prevents unauthorized automated merges with negligible latency overhead (<2 seconds total machine time). The reference implementation is available at https://github.com/pohi-protocol/pohi.
```

**Links**
- DOI: https://doi.org/10.5281/zenodo.20729026
- Code: https://github.com/pohi-protocol/pohi
- Live demo: https://pohi-demo.vercel.app/

## 4. Suggested Hubs / topics

Cryptography · Computer Science · Blockchain · Artificial Intelligence ·
Software Engineering · Computer Security & Cryptography

## 5. Optional — opening discussion post

Pin a short comment so the thread starts with context, not just metadata:

```
PoHI gives AI-driven pipelines a cryptographic answer to "did a human actually approve this?"

As agents start merging PRs and deploying to production, "the AI did it" stops being acceptable provenance. PoHI binds a zero-knowledge proof of personhood (World ID and 8 other providers) to a specific commit and records it in an append-only transparency log — answering who / what / when, verifiably.

Open reference implementation, live demo, and the paper are linked above. Feedback on the threat model and the proof-of-personhood provider trade-offs is very welcome — and if anyone can endorse for arXiv cs.CR / cs.SE, please reach out.
```

## 6. After posting

- Add the ResearchHub link to the repo README (next to the DOI badge).
- Consider a small RSC bounty for a thorough review or an arXiv endorsement.
