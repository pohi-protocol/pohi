<!--
ResearchHub preprint — paste-ready body (paste-safe).

The ResearchHub editor converts inline **bold**, *italic*, "- " bullets, and
links on paste, but NOT "##" headings or "| | |" Markdown tables. So this file
uses bold lines for subheadings and bullet lists instead of tables.

The ResearchHub editor already provides the six top-level headings
(Title / Abstract / Introduction / Methods / Results / Discussion). Do NOT paste
the "# PASTE INTO:" marker lines — copy only the content under each marker into
the matching editor section.

Canonical version of record: https://doi.org/10.5281/zenodo.20729026
Source LaTeX: paper/main.tex
-->

# PASTE INTO: Preprint Title

Proof of Human Intent: Cryptographically Verifiable Human Approval for AI-Driven Software Development

---

# PASTE INTO: Abstract

With the rise of autonomous AI agents capable of proposing and executing software changes, traditional human-in-the-loop assumptions no longer hold. As these agents increasingly automate code generation, review, and deployment, the provenance of "human intent" — the accountability behind critical decisions — is becoming obscured. Current systems lack mechanisms to cryptographically verify that a human, rather than an automated process, authorized specific actions such as merging pull requests or deploying to production.

We present Proof of Human Intent (PoHI), a protocol that leverages zero-knowledge proofs of personhood (e.g., World ID) and on-chain transparency logs to create tamper-evident, machine-verifiable records of human approval. The architecture can optionally integrate with decentralized identifiers (DIDs) and verifiable credentials (VCs) for enterprise authorization policies. It addresses three fundamental questions: (1) who approved an action (unique human verification), (2) what was approved (cryptographic binding to specific commits), and (3) when it was approved (immutable timestamping).

We implement a proof-of-concept integration with GitHub Actions and demonstrate that PoHI prevents unauthorized automated merges with negligible latency overhead (<2 seconds total machine time). The reference implementation is available at https://github.com/pohi-protocol/pohi.

---

# PASTE INTO: Introduction

The rapid advancement of AI-driven development tools has fundamentally transformed software development workflows. Tools such as GitHub Copilot, Claude Code, and autonomous coding agents can now generate, review, and even propose merging code changes with minimal human intervention. While this automation dramatically increases developer productivity, it raises critical questions about accountability: *Who approved this code? Was it a human or an AI? Can we prove it?*

Consider a scenario where an AI agent autonomously creates a pull request, reviews it using another AI system, and merges it into production — all without meaningful human oversight. In 2024, GitHub Copilot assists in over 46% of code written by developers using the tool. By 2025, autonomous coding agents like Devin, Claude Code Agent, and GPT Engineer can complete entire development tasks end-to-end. This trend points toward a future where AI systems not only write code but also manage significant portions of the software lifecycle.

The accountability gap becomes critical when we consider:

- **Security incidents**: If malicious code is introduced, who is responsible?
- **Regulatory compliance**: Industries like finance and healthcare require human approval for critical changes.
- **Audit requirements**: SOC 2, ISO 27001, and similar frameworks mandate traceable approval processes.
- **Legal liability**: Contracts may require human sign-off for software releases.

Current solutions rely on social conventions (e.g., requiring reviews) or process controls (e.g., protected branches), but these are easily circumvented and lack cryptographic verifiability. There is no mechanism to prove, after the fact, that a genuine human — not a bot or automated system — approved a specific action.

**Contributions**

- **Novel problem identification**: We identify the "human approval verification gap" — the inability to cryptographically prove that a human (rather than an automated system) authorized a specific software action. This gap is not addressed by existing supply chain security frameworks such as SLSA, Sigstore, or SCITT, which focus on artifact integrity rather than human verification.
- **First integrated protocol**: We propose PoHI, the first protocol that combines zero-knowledge proofs of personhood with software supply chain attestations, enabling cryptographically verifiable human approval without revealing user identity.
- **Formal security analysis**: We define formal security properties (unforgeability, replay resistance, Sybil resistance, and binding) and provide proofs under standard cryptographic assumptions.
- **Practical implementation**: We provide an open-source reference implementation including a GitHub Action, CLI tool, and smart contracts, demonstrating negligible latency overhead (<2 seconds) for real-world CI/CD integration.

**Background and Related Work**

*AI agents in software development.* The evolution of AI in software development can be characterized in three phases. Phase 1 (2021–2023): completion-based assistants — GitHub Copilot and similar tools provide inline code suggestions; the human developer remains in control. Phase 2 (2024–2025): agentic assistants — tools like Claude Code, Cursor, and Windsurf execute multi-step tasks, run commands, and modify files autonomously within developer-defined boundaries. Phase 3 (2025+): autonomous agents — systems like Devin and OpenAI's Operator complete entire tasks independently, including creating pull requests. This progression shifts developers from "implementers" to "approvers," creating an urgent need for verifiable human oversight.

*Proof of personhood (PoP).* PoP systems verify that an entity is a unique human without revealing their identity. World ID uses iris biometrics via specialized hardware (Orb) to create a unique identifier, with zero-knowledge proofs that prove humanity without revealing biometric data (Device and Orb levels). BrightID uses a social-graph vouching approach (more accessible, more susceptible to Sybil collusion). Gitcoin Passport aggregates identity signals into a "humanity score" (gradual verification, no binary uniqueness guarantee). We use World ID as a concrete provider due to its strong Sybil resistance and privacy-preserving properties.

PoHI is provider-agnostic: it requires any PoP system to satisfy three properties — (1) uniqueness (each human can obtain at most one valid credential), (2) unlinkability (proofs for different actions cannot be correlated), and (3) binding (proofs can be cryptographically bound to arbitrary signals such as commit hashes). Any scheme meeting these — including future systems based on social graphs, behavioral biometrics, or hardware attestation — can be substituted without changes to the core protocol.

*Software supply chain security.* SCITT (IETF) maintains append-only transparency logs of supply chain claims; Sigstore enables keyless code signing via OIDC with transparency logs (Rekor); SLSA defines a framework for artifact integrity through provenance. These address artifact integrity but not the human approval aspect. PoHI complements them by adding a human verification layer.

*Decentralized identity.* W3C DIDs and Verifiable Credentials (VCs) provide a foundation for self-sovereign identity. PoHI leverages these for its (optional) Authority Layer, enabling organizations to issue credentials specifying who can approve what.

*AI agent authorization.* Prior work on "authenticated delegation" for AI agents focuses on what agents are authorized to do. PoHI addresses the complementary problem: verifying that a human actually approved an action, regardless of whether AI agents executed it.

*Comparison.* Existing supply chain frameworks (SLSA, Sigstore, SCITT) provide artifact binding but no human verification or Sybil resistance. PoP systems (BrightID, Gitcoin Passport) verify human uniqueness but lack binding to specific artifacts. PoHI uniquely combines both. By system (human verification / artifact binding / Sybil resistance):

- SLSA: no / yes / no
- Sigstore: no / yes / no
- SCITT: no / yes / no
- BrightID: yes / no / weak
- Gitcoin Passport: yes / no / heuristic
- **PoHI (ours): yes / yes / strong**

**Threat Model**

*System model.* A software development environment with developers (human authors/reviewers), AI agents (automated systems that generate code and create PRs), a Git-based repository, and a CI/CD pipeline.

*Adversary capabilities.* We assume an adversary who can control AI agents with repository access, create commits and PRs programmatically, attempt to forge or replay approval attestations, and create multiple fake identities (Sybil). We also consider the insider threat: a legitimate user with valid World ID credentials who intentionally approves malicious changes — PoHI provides cryptographic evidence of who approved (enabling post-incident attribution) but does not prevent authorized insiders from acting maliciously.

*Security goals.* (1) Human verification — actions are verifiably approved by unique humans; (2) Binding — approval is bound to specific code states; (3) Non-repudiation (cryptographic); (4) Tamper evidence.

*Trust assumptions.* We assume the World ID ZK-SNARK system is sound and Orb enrollment provides strong uniqueness (device-level is weaker); the reference implementation treats the World ID verification API as a trusted third party (on-chain verification can remove this at higher latency/cost); and the underlying blockchain (World Chain) provides immutability, censorship resistance, and reliable timestamping.

*Scope and limitations.* PoHI guarantees that a specific signal (commit hash) was approved by a unique human identity. It does not guarantee the approver semantically understood the change. Social-engineering attacks (coercing/tricking a human into approving a malicious commit) are out of scope for the cryptographic protocol, though UI mitigations (clearly displaying commit details before approval) are recommended. PoHI does not prevent a malicious insider with legitimate credentials from approving harmful changes; organizational access controls and code review remain complementary. PoHI separates proof of human presence from authorization semantics — authority is enforced through external policy and governance layers.

---

# PASTE INTO: Methods

**Architecture overview**

PoHI consists of four layers that together create verifiable human approval records:

1. **Identity Layer** — verifies the approver is a unique human using World ID.
2. **Authority Layer** — manages permissions using DIDs and VCs (optional).
3. **Attestation Layer** — records events on-chain for immutable transparency.
4. **Integration Layer** — connects with Git workflows.

The core data structure is the HumanApprovalAttestation, which binds: a proof of human identity (World ID nullifier hash); a specific software artifact (commit SHA); an action type (merge, deploy, release); and a timestamp (block time or signed timestamp).

**Identity Layer**

The Identity Layer leverages World ID's zero-knowledge proof system. When a user approves an action:

1. The system generates a signal by hashing the repository and commit SHA: signal = SHA256(repository + ":" + commit_sha).
2. The user scans a QR code with the World App, which generates a ZK proof binding their World ID to this signal.
3. The proof includes a nullifier_hash unique to this user-action combination, preventing the same human from approving the same commit twice within the same repository and action scope, while preserving privacy.

The signal is deliberately limited to repository and commit SHA to provide a minimal, unambiguous binding; additional metadata (action type, timestamp) is recorded in the attestation structure rather than the signal, so the same ZK proof verifies independently of attestation formatting. The nullifier is domain-separated by the World ID application identifier, preventing cross-application correlation. Verification levels: Device (phone-based, lower assurance) and Orb (biometric, higher assurance).

**Authority Layer (optional)**

Enables organizations to define who can approve what. DIDs identify organizations and individuals; VCs specify approval authorities (e.g., "Alice can approve production deployments for repo X"). Not required for basic operation, but enables enterprise role-based approval policies.

**Attestation Layer**

Creates and stores attestation records using two hash algorithms: SHA-256 (protocol-standard, off-chain storage and interoperability) and Keccak-256 (EVM-native, on-chain recording). On-chain storage on World Chain provides immutability and tamper evidence, public verifiability, censorship resistance, and timestamping via block inclusion. The smart contract enforces uniqueness of attestation hashes, prevention of duplicate approvals (same nullifier + commit), and revocation by the original approver or admins.

**Integration Layer**

GitHub Action — can be added to any repository to enforce human approval before merging. When triggered it: (1) creates an approval request with the commit SHA, (2) posts a QR code to the PR for World ID verification, (3) waits for human approval via the World App, (4) records the attestation and updates PR status.

End-to-end verification flow: PR created → GitHub Action → QR code posted → human scans (World App) → ZK proof verified (World ID API) → attestation created and stored (on-chain optional) → merge enabled.

CLI tool — request and verify approvals outside CI/CD. SDK — TypeScript libraries for integrating PoHI into custom applications.

**Implementation**

PoHI is a modular TypeScript library:

- pohi-core — chain-neutral types, validation, and SHA-256 hashing (zero dependencies)
- pohi-evm — EVM utilities for Keccak-256 and on-chain encoding
- pohi-sdk — client for World Chain interaction
- pohi-cli — command-line tool
- pohi-action — GitHub Action for CI/CD integration
- pohi-contracts — Solidity smart contracts (Foundry)

The core library has zero runtime dependencies, enabling use in constrained environments; the modular design lets users adopt only what they need.

*Attestation data model.* The attestation JSON contains: version (schema version, e.g. "1.0"); type ("HumanApprovalAttestation"); subject (repository, commit_sha, action such as PR_MERGE or DEPLOY); human_proof (method = "world_id", verification_level = "device" or "orb", nullifier_hash); timestamp (ISO 8601); and proof (Ed25519 JWS signature).

---

# PASTE INTO: Results

**Formal security analysis**

Let A denote an attestation, H a cryptographic hash function (SHA-256), π a World ID zero-knowledge proof, and ν the nullifier hash derived from the proof.

Definitions:

- *Unforgeability* — no PPT adversary can produce a valid attestation A* for a commit c without a valid World ID proof π for signal s = H(repo + c), except with negligible probability.
- *Replay resistance* — a valid attestation for commit c1 cannot be used to verify approval for a different commit c2 ≠ c1.
- *Sybil resistance* — each unique human can produce at most one valid attestation per (repository, commit, action) tuple.
- *Binding* — any modification to the subject S causes verification failure.

*Theorem 1 (Unforgeability).* Attestations are unforgeable under the soundness of the World ID ZK-SNARK system and collision resistance of SHA-256. Proof sketch: verification requires a valid ZK proof π verifying against the World ID contract, with the proof's signal matching H(repo + c). By ZK-SNARK soundness, an adversary cannot produce π without the witness (World ID credentials); forging therefore requires breaking ZK-SNARK soundness or SHA-256 collision resistance, both assumed infeasible.

*Theorem 2 (Replay resistance).* Under SHA-256 collision resistance. Proof sketch: replaying an attestation for c1 on c2 requires H(repo + c1) = H(repo + c2) with c1 ≠ c2 — a SHA-256 collision, infeasible under standard assumptions.

*Theorem 3 (Sybil resistance).* Bounded by the uniqueness of the underlying World ID system. Proof sketch: the nullifier ν is derived deterministically from the user's World ID identity and the application-specific external nullifier; per (repository, action) scope each unique World ID yields a unique ν, and the on-chain registry rejects duplicates. Multiple attestations would require multiple World ID identities (prevented by biometric uniqueness at Orb level) or a nullifier collision (infeasible).

*Theorem 4 (Binding).* Proof sketch: the attestation hash h = H(A) includes all subject fields (repository, commit_sha, action); any modification changes h, causing verification failure against the recorded hash.

Attack vector analysis (attack — mitigation — guarantee):

- Forgery — Theorem 1 — computational
- Replay — Theorem 2 — computational
- Sybil — Theorem 3 — biometric + cryptographic
- Tampering — Theorem 4 — computational
- Front-running — on-chain ordering — blockchain

**Performance evaluation**

End-to-end latency of the approval verification flow (reference implementation), per operation (time, std dev):

- Attestation construction: <5 ms (±1)
- Hash computation (SHA-256): <1 ms (±0.1)
- World ID proof verification (API): 1,200 ms (±300)
- GitHub status update: 250 ms (±50)
- On-chain recording (optional): 3,000 ms (±500)
- **Total machine time: ~1,500 ms**

The primary latency factor is the external World ID verification API (~1.2s), acceptable for asynchronous PR workflows. Cryptographic binding overhead (SHA-256 hashing and signature verification) is negligible (<5ms) on standard CI/CD runners. Human interaction time (scanning the QR code) is excluded from machine time as it varies by user but typically takes 5–15 seconds. The protocol overhead introduced by PoHI itself remains negligible, independent of the underlying PoP provider.

**Gas costs**

On-chain operation costs (operation — gas units):

- recordAttestation — ~150,000
- revokeAttestation — ~30,000
- isValidAttestation (view) — 0

At typical World Chain gas prices, recording an attestation costs less than $0.01 USD. These results indicate PoHI can be integrated into existing CI/CD pipelines with negligible overhead.

**Reproducibility.** The reference implementation is publicly available at https://github.com/pohi-protocol/pohi under the Apache 2.0 license. Measurements were conducted on GitHub Actions runners (Ubuntu 22.04, 2-core CPU) using the deployed World Chain Sepolia testnet. The demo application is at https://pohi-demo.vercel.app.

---

# PASTE INTO: Discussion

**Design philosophy: presence vs. understanding**

A natural critique is that PoHI proves human *presence* but not human *understanding*. This separation is intentional. PoHI verifies that a unique human approved a specific action at a specific time — cryptography can provide this guarantee. Whether that human semantically understood the changes, verified their correctness, or made an informed decision remains a socio-technical responsibility that no cryptographic protocol can enforce.

We argue this separation is appropriate: (1) it matches real-world accountability models where signatures attest to approval, not comprehension; (2) it enables automation of the verifiable component while leaving judgment to humans and organizations; and (3) cryptographically verifying "understanding" would require solving fundamentally unsolvable problems in human cognition assessment. PoHI provides the cryptographic foundation; organizational policies, code review, and UI design must address the understanding component.

**Limitations**

- **World ID Orb availability**: the highest assurance level (Orb) requires physical access to specialized hardware with limited global availability. Device-level verification is a fallback with weaker Sybil resistance.
- **Verification-level trade-offs**: device-level relies on phone attestation rather than biometrics, making it susceptible to sophisticated device spoofing. Organizations needing strong guarantees should mandate Orb-level verification.
- **API trust dependency**: the reference implementation relies on World ID's verification API (a trusted third party). On-chain verification is possible but increases latency and cost.
- **Privacy in transparency logs**: on-chain attestations are public. Nullifier hashes preserve identity privacy, but the fact that someone approved a specific commit is public. Private approvals require off-chain storage with selective disclosure.
- **Adoption barriers**: integration requires installing the World App and completing verification, adding friction; organizational rollout requires change management.

**Future work**

- Policy-as-code integration.
- Cross-organization trust federation.
- Privacy-preserving audit mechanisms.
- Support for emerging standards such as Verifiable Credentials v2.0.
- Broader interoperability across proof-of-personhood providers.
- Formal compatibility specification for third-party implementations.

We encourage PoHI-compatible implementations that preserve the core principle of cryptographically verifiable human intent while adapting to diverse architectural requirements.

**Conclusion**

As AI agents become increasingly capable of autonomous software development, the ability to verify human approval becomes critical for accountability and security. We presented Proof of Human Intent (PoHI), a protocol combining zero-knowledge proofs, decentralized identity, and transparency logs to create verifiable records of human approval. PoHI shifts accountability in AI-driven development from implicit trust to cryptographically verifiable intent, establishing a foundation for human oversight in an increasingly automated software ecosystem.

*Full version of record (PDF + references): https://doi.org/10.5281/zenodo.20729026*
