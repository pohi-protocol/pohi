import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type WalletClient,
  type Chain,
  type Account,
  type Transport,
  type Hash,
  type Address,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import type { HumanApprovalAttestation } from 'pohi-core'
import { verificationLevelToNumber } from 'pohi-core'
import { commitShaToBytes32, computeEvmAttestationHash, nullifierToBytes32 } from 'pohi-evm'
import { pohiRegistryAbi } from './abi'
import { worldChain, worldChainSepolia } from './chains'

/**
 * On-chain attestation record
 */
export interface OnChainAttestation {
  attestationHash: `0x${string}`
  repository: string
  commitSha: `0x${string}`
  nullifierHash: `0x${string}`
  verificationLevel: number
  timestamp: bigint
  revoked: boolean
  recorder: Address
}

/**
 * PoHI SDK configuration
 */
export interface PoHIClientConfig {
  /** Network to connect to */
  network: 'mainnet' | 'sepolia'
  /** Optional custom RPC URL */
  rpcUrl?: string
  /** Private key for write operations (optional) */
  privateKey?: `0x${string}`
  /** Contract address (uses default if not provided) */
  contractAddress?: Address
}

/**
 * Default contract addresses by network
 */
const DEFAULT_CONTRACTS: Record<string, Address> = {
  mainnet: '0x0000000000000000000000000000000000000000', // TBD
  sepolia: '0x0000000000000000000000000000000000000000', // TBD
}

/**
 * PoHI Client for interacting with the on-chain registry
 */
export class PoHIClient {
  private readonly publicClient: PublicClient<Transport, Chain>
  private readonly walletClient: WalletClient<Transport, Chain, Account> | null
  private readonly contractAddress: Address
  private readonly chain: Chain

  constructor(config: PoHIClientConfig) {
    this.chain = config.network === 'mainnet' ? worldChain : worldChainSepolia
    this.contractAddress = config.contractAddress || DEFAULT_CONTRACTS[config.network]

    const transport = http(config.rpcUrl)

    this.publicClient = createPublicClient({
      chain: this.chain,
      transport,
    }) as PublicClient<Transport, Chain>

    if (config.privateKey) {
      const account = privateKeyToAccount(config.privateKey)
      this.walletClient = createWalletClient({
        chain: this.chain,
        transport,
        account,
      }) as WalletClient<Transport, Chain, Account>
    } else {
      this.walletClient = null
    }
  }

  /**
   * Get the contract address
   */
  getContractAddress(): Address {
    return this.contractAddress
  }

  /**
   * Get the chain configuration
   */
  getChain(): Chain {
    return this.chain
  }

  /**
   * Record an attestation on-chain
   * Note: Uses EVM-compatible keccak256 hash (different from protocol SHA-256)
   */
  async recordAttestation(attestation: HumanApprovalAttestation): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error('Wallet not configured. Provide privateKey in config.')
    }

    // Compute EVM-compatible hash for on-chain storage
    const evmHash = computeEvmAttestationHash(attestation)
    const commitSha = commitShaToBytes32(attestation.subject.commit_sha || '')
    const nullifier = nullifierToBytes32(attestation.human_proof.nullifier_hash)
    const verificationLevel = verificationLevelToNumber(attestation.human_proof.verification_level)

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      abi: pohiRegistryAbi,
      functionName: 'recordAttestation',
      args: [
        evmHash,
        attestation.subject.repository || '',
        commitSha,
        nullifier,
        verificationLevel,
      ],
    })

    return hash
  }

  /**
   * Revoke an attestation
   */
  async revokeAttestation(attestationHash: `0x${string}`, reason: string): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error('Wallet not configured. Provide privateKey in config.')
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      abi: pohiRegistryAbi,
      functionName: 'revokeAttestation',
      args: [attestationHash, reason],
    })

    return hash
  }

  /**
   * Get an attestation by hash
   */
  async getAttestation(attestationHash: `0x${string}`): Promise<OnChainAttestation> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: pohiRegistryAbi,
      functionName: 'getAttestation',
      args: [attestationHash],
    })

    return {
      attestationHash: result.attestationHash,
      repository: result.repository,
      commitSha: result.commitSha,
      nullifierHash: result.nullifierHash,
      verificationLevel: result.verificationLevel,
      timestamp: result.timestamp,
      revoked: result.revoked,
      recorder: result.recorder,
    }
  }

  /**
   * Check if an attestation is valid (exists and not revoked)
   */
  async isValidAttestation(attestationHash: `0x${string}`): Promise<boolean> {
    return this.publicClient.readContract({
      address: this.contractAddress,
      abi: pohiRegistryAbi,
      functionName: 'isValidAttestation',
      args: [attestationHash],
    })
  }

  /**
   * Get all attestation hashes for a specific commit
   */
  async getAttestationsForCommit(
    repository: string,
    commitSha: string
  ): Promise<readonly `0x${string}`[]> {
    const commitShaBytes = commitShaToBytes32(commitSha)

    return this.publicClient.readContract({
      address: this.contractAddress,
      abi: pohiRegistryAbi,
      functionName: 'getAttestationsForCommit',
      args: [repository, commitShaBytes],
    })
  }

  /**
   * Check if a commit has any valid attestations
   */
  async hasValidAttestation(repository: string, commitSha: string): Promise<boolean> {
    const commitShaBytes = commitShaToBytes32(commitSha)

    return this.publicClient.readContract({
      address: this.contractAddress,
      abi: pohiRegistryAbi,
      functionName: 'hasValidAttestation',
      args: [repository, commitShaBytes],
    })
  }

  /**
   * Get the count of valid attestations for a commit
   */
  async getValidAttestationCount(repository: string, commitSha: string): Promise<bigint> {
    const commitShaBytes = commitShaToBytes32(commitSha)

    return this.publicClient.readContract({
      address: this.contractAddress,
      abi: pohiRegistryAbi,
      functionName: 'getValidAttestationCount',
      args: [repository, commitShaBytes],
    })
  }

  /**
   * Get all attestation hashes for a nullifier
   */
  async getAttestationsForNullifier(nullifierHash: `0x${string}`): Promise<readonly `0x${string}`[]> {
    return this.publicClient.readContract({
      address: this.contractAddress,
      abi: pohiRegistryAbi,
      functionName: 'getAttestationsForNullifier',
      args: [nullifierHash],
    })
  }

  /**
   * Wait for a transaction to be confirmed
   */
  async waitForTransaction(hash: Hash): Promise<void> {
    await this.publicClient.waitForTransactionReceipt({ hash })
  }
}
