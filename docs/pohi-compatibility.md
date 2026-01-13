# PoHI Compatibility Levels

This document defines compatibility levels for implementations claiming alignment with the **Proof of Human Intent (PoHI)** protocol.

PoHI compatibility is intentionally **graded, not binary**, to support diverse architectures, use cases, and stages of adoption.

---

## 🟢 Level 1: PoHI-Core Compatible

### Definition

PoHI-Core implementations satisfy the **minimal, protocol-defining properties** of Proof of Human Intent. This level represents the irreducible core of PoHI.

### Requirements

A PoHI-Core compatible implementation **MUST**:

1. Represent human intent as a **cryptographically verifiable artifact** (e.g., digital signature, approval proof, or equivalent)
2. Ensure that the intent originates from a **human-controlled action**
3. **Bind intent** to a specific action, artifact, or decision
4. Allow third parties to verify that:
   - A human approved the action
   - The approval occurred before execution

### Non-Requirements

PoHI-Core implementations do **NOT** require:

- Decentralized identity (DID)
- Zero-knowledge proofs
- Blockchain or on-chain components
- A specific cryptographic primitive

### Examples

- Signed approval for AI-generated code before merge
- Human-signed authorization for autonomous agent execution

---

## 🔵 Level 2: PoHI-Extended Compatible

### Definition

PoHI-Extended implementations build upon PoHI-Core by adding **verifiability, interoperability, or stronger guarantees**.

### Additional Requirements

A PoHI-Extended compatible implementation **MUST**:

1. Satisfy all PoHI-Core requirements
2. Provide **verifiable provenance of intent**, such as:
   - Tamper-evident logs
   - Transparency records
   - Auditable approval chains
3. Enable **independent verification** without relying on private trust

### Common Extensions

PoHI-Extended implementations **MAY** include:

- Decentralized Identifiers (DIDs)
- Verifiable Credentials (VCs)
- Transparency logs (e.g., SCITT-style)
- Replay protection and revocation semantics

### Examples

- CI/CD pipelines with cryptographically auditable human approvals
- AI agent systems with externally verifiable approval logs

---

## 🟣 Level 3: PoHI-Advanced Compatible

### Definition

PoHI-Advanced implementations provide the **strongest guarantees** by incorporating privacy-preserving proofs, global uniqueness, or cross-system trust.

This level targets research, large-scale systems, and standardization efforts.

### Additional Requirements

A PoHI-Advanced compatible implementation **MUST**:

1. Satisfy all PoHI-Extended requirements
2. Support advanced properties such as:
   - Privacy-preserving verification of human approval
   - Resistance to Sybil or automation attacks
   - Cross-domain or cross-organizational verification

### Advanced Capabilities (Optional)

PoHI-Advanced implementations **MAY** include:

- Zero-knowledge proofs
- Proof of Personhood mechanisms
- On-chain or cross-chain attestations
- Formal verification of approval semantics

### Examples

- Anonymous yet verifiable human approval for AI governance
- Cross-organization approval verification without identity disclosure

---

## ⚠️ Compatibility Notes

- PoHI compatibility is **self-declared**, not certified
- Higher levels are **strict supersets** of lower levels
- Implementations **SHOULD** clearly state:
  - Claimed compatibility level(s)
  - Deviations from the reference design
  - Security and trust assumptions

---

## 📌 Naming Convention (Recommended)

Projects are encouraged to describe compatibility using the following format:

- `PoHI-Core compatible`
- `PoHI-Extended compatible`
- `PoHI-Advanced compatible`

**Example:**

> "This system is PoHI-Extended compatible and adds transparency logging for verifiable human approvals in AI-driven workflows."

---

## 📜 Prior Art Reminder

**Proof of Human Intent (PoHI) is published as prior art.**

This document defines compatibility levels for implementations based on the original PoHI concept and reference implementation defined in the [pohi-protocol/pohi](https://github.com/pohi-protocol/pohi) repository.

See [NOTICE](../NOTICE) for full attribution and prior art declaration.
