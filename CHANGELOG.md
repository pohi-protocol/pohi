# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-01-20

### Added
- **4 new PoP providers** for expanded verification options:
  - **Holonym**: ZK identity verification with government ID and ePassport support
  - **Idena**: AI-resistant CAPTCHA through decentralized validation ceremonies
  - **Coinbase Verifications**: KYC attestation via Ethereum Attestation Service (EAS) on Base
  - **Humanity Protocol**: Palm-based biometric verification
- Comprehensive test coverage for all new providers
- Complete provider documentation in `docs/providers.md`
- ESLint 9 configuration with flat config format

### Changed
- Updated README with all 9 supported PoP providers
- Updated Japanese README (README_ja.md) with new providers
- Improved code formatting across all packages

## [0.2.0] - 2026-01-10

### Added
- E2E tests for demo application using Playwright
- TypeDoc API documentation generation
- Japanese README (README_ja.md)
- Dynamic OG images for social sharing
- IACR ePrint paper submission
- BrightID provider registration (in progress)

### Changed
- Updated paper references (VC v2.0, SCITT draft, arXiv:2501.09674)
- Improved README with ePrint submission status

## [0.1.0] - 2026-01-06

### Added

#### Core Library (`pohi-core`)
- Chain-neutral types and validation for PoHI attestations
- SHA-256 based attestation hashing (protocol standard)
- Canonical JSON serialization for deterministic hashing
- Support for multiple PoP providers:
  - World ID (ZK proofs)
  - Gitcoin Passport (score-based)
  - BrightID (social graph)
  - Civic (gateway pass)
  - Proof of Humanity (Kleros registry)
- Attestation creation, validation, and serialization utilities
- Zero runtime dependencies

#### EVM Utilities (`pohi-evm`)
- Keccak-256 hashing for on-chain compatibility
- `encodePacked` implementation matching Solidity
- Signal computation for EVM contracts

#### SDK (`pohi-sdk`)
- World Chain client for on-chain attestation recording
- Support for World Chain Mainnet (480) and Sepolia (4801)
- Type-safe contract interactions using viem

#### CLI (`pohi-cli`)
- Command-line tool for requesting and verifying attestations
- QR code generation for World ID verification
- Interactive approval flow

#### GitHub Action (`pohi-action`)
- GitHub Action for requiring human approval on PRs
- Automatic status checks integration
- Support for `needs-human-approval` label workflow

#### GitLab CI (`pohi-gitlab-ci`)
- GitLab CI component for human approval gates
- Pipeline integration for merge requests

#### Bitbucket Pipe (`pohi-bitbucket-pipe`)
- Bitbucket Pipe for human approval in pipelines
- Pull request verification support

#### Smart Contracts (`pohi-contracts`)
- `PoHIRegistry` contract for on-chain attestation storage
- Sybil attack prevention (nullifier + commit uniqueness)
- Attestation revocation support
- Admin role management
- Deployed to World Chain Sepolia: [`0xe3aF97c1Eb0c1Bfa872059270a947e8A10FFD9d1`](https://worldchain-sepolia.explorer.alchemy.com/address/0xe3af97c1eb0c1bfa872059270a947e8a10ffd9d1)

#### Demo Application (`pohi-demo`)
- Next.js 14 demo application with World ID integration
- Live demo at https://pohi-demo.vercel.app/
- Multi-provider support UI
- Dark mode / light mode toggle
- Copy buttons for attestation data
- FAQ section
- Responsive design

#### Documentation
- Protocol specification (SPEC.md)
- Architecture documentation
- Use cases documentation
- Getting started guide
- Security documentation (SECURITY.md)
- Academic paper draft (LaTeX)

### Security
- Initial security self-review completed
- Replay attack mitigation via commit SHA binding
- Sybil resistance through PoP provider nullifiers
- Audit documentation (AUDIT.md)

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 0.3.0 | 2026-01-20 | 4 new PoP providers (Holonym, Idena, Coinbase, Humanity Protocol) |
| 0.2.0 | 2026-01-10 | E2E tests, TypeDoc, Japanese README, ePrint submission |
| 0.1.0 | 2026-01-06 | Initial release with core functionality |

[Unreleased]: https://github.com/pohi-protocol/pohi/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/pohi-protocol/pohi/releases/tag/v0.3.0
[0.2.0]: https://github.com/pohi-protocol/pohi/releases/tag/v0.2.0
[0.1.0]: https://github.com/pohi-protocol/pohi/releases/tag/v0.1.0
