import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PoHIClient, type PoHIClientConfig } from './client'
import { worldChain, worldChainSepolia } from './chains'
import type { HumanApprovalAttestation } from 'pohi-core'

// Mock viem
vi.mock('viem', async () => {
  const actual = await vi.importActual('viem')
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({
      readContract: vi.fn(),
      waitForTransactionReceipt: vi.fn(),
    })),
    createWalletClient: vi.fn(() => ({
      writeContract: vi.fn(),
    })),
    http: vi.fn(() => 'mock-transport'),
  }
})

vi.mock('viem/accounts', () => ({
  privateKeyToAccount: vi.fn(() => ({
    address: '0x1234567890123456789012345678901234567890',
  })),
}))

// ============ Chain Configuration Tests ============

describe('chains', () => {
  it('worldChain should have correct chain ID', () => {
    expect(worldChain.id).toBe(480)
  })

  it('worldChainSepolia should have correct chain ID', () => {
    expect(worldChainSepolia.id).toBe(4801)
  })

  it('worldChainSepolia should be marked as testnet', () => {
    expect(worldChainSepolia.testnet).toBe(true)
  })
})

// ============ PoHIClient Configuration Tests ============

describe('PoHIClient', () => {
  describe('constructor', () => {
    it('should create client with mainnet config', () => {
      const config: PoHIClientConfig = {
        network: 'mainnet',
      }
      const client = new PoHIClient(config)

      expect(client.getChain()).toBe(worldChain)
    })

    it('should create client with sepolia config', () => {
      const config: PoHIClientConfig = {
        network: 'sepolia',
      }
      const client = new PoHIClient(config)

      expect(client.getChain()).toBe(worldChainSepolia)
    })

    it('should use custom contract address if provided', () => {
      const customAddress = '0x1234567890123456789012345678901234567890' as const
      const config: PoHIClientConfig = {
        network: 'sepolia',
        contractAddress: customAddress,
      }
      const client = new PoHIClient(config)

      expect(client.getContractAddress()).toBe(customAddress)
    })

    it('should use custom RPC URL if provided', () => {
      const config: PoHIClientConfig = {
        network: 'sepolia',
        rpcUrl: 'https://custom-rpc.example.com',
      }
      // Should not throw
      expect(() => new PoHIClient(config)).not.toThrow()
    })
  })

  describe('getContractAddress', () => {
    it('should return contract address', () => {
      const config: PoHIClientConfig = {
        network: 'sepolia',
      }
      const client = new PoHIClient(config)

      expect(client.getContractAddress()).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })
  })

  describe('getChain', () => {
    it('should return chain for mainnet', () => {
      const client = new PoHIClient({ network: 'mainnet' })
      expect(client.getChain().id).toBe(480)
    })

    it('should return chain for sepolia', () => {
      const client = new PoHIClient({ network: 'sepolia' })
      expect(client.getChain().id).toBe(4801)
    })
  })

  describe('write operations without wallet', () => {
    it('recordAttestation should throw when wallet not configured', async () => {
      const client = new PoHIClient({ network: 'sepolia' })
      const attestation = {
        version: '1.0' as const,
        type: 'HumanApprovalAttestation' as const,
        subject: {
          repository: 'owner/repo',
          commit_sha: 'abc123',
          action: 'DEPLOY',
        },
        human_proof: {
          method: 'world_id',
          nullifier_hash: '0x1234',
          signal: '0xabcd',
        },
        timestamp: new Date().toISOString(),
      }

      await expect(client.recordAttestation(attestation)).rejects.toThrow(
        'Wallet not configured'
      )
    })

    it('revokeAttestation should throw when wallet not configured', async () => {
      const client = new PoHIClient({ network: 'sepolia' })

      await expect(
        client.revokeAttestation('0x' + '0'.repeat(64) as `0x${string}`, 'test reason')
      ).rejects.toThrow('Wallet not configured')
    })
  })

  describe('client with wallet configured', () => {
    let clientWithWallet: PoHIClient
    const testPrivateKey = '0x' + 'a'.repeat(64) as `0x${string}`

    beforeEach(() => {
      clientWithWallet = new PoHIClient({
        network: 'sepolia',
        privateKey: testPrivateKey,
        contractAddress: '0x1234567890123456789012345678901234567890',
      })
    })

    it('should create client with wallet when privateKey is provided', () => {
      expect(clientWithWallet.getChain()).toBe(worldChainSepolia)
      expect(clientWithWallet.getContractAddress()).toBe('0x1234567890123456789012345678901234567890')
    })

    it('recordAttestation should call writeContract', async () => {
      const attestation: HumanApprovalAttestation = {
        version: '1.0',
        type: 'HumanApprovalAttestation',
        subject: {
          repository: 'owner/repo',
          commit_sha: 'abc123def456',
          action: 'DEPLOY',
        },
        human_proof: {
          method: 'world_id',
          nullifier_hash: '0x' + '1'.repeat(64),
          signal: '0xabcd',
        },
        timestamp: new Date().toISOString(),
        attestation_hash: '0x' + '2'.repeat(64),
      }

      // The wallet client is mocked, so we need to access the mock
      const { createWalletClient } = await import('viem')
      const mockWriteContract = vi.fn().mockResolvedValue('0x' + 'f'.repeat(64))
      vi.mocked(createWalletClient).mockReturnValue({
        writeContract: mockWriteContract,
      } as never)

      // Create new client to pick up the mock
      const client = new PoHIClient({
        network: 'sepolia',
        privateKey: testPrivateKey,
        contractAddress: '0x1234567890123456789012345678901234567890',
      })

      const txHash = await client.recordAttestation(attestation)
      expect(txHash).toBe('0x' + 'f'.repeat(64))
    })

    it('revokeAttestation should call writeContract', async () => {
      const { createWalletClient } = await import('viem')
      const mockWriteContract = vi.fn().mockResolvedValue('0x' + 'e'.repeat(64))
      vi.mocked(createWalletClient).mockReturnValue({
        writeContract: mockWriteContract,
      } as never)

      const client = new PoHIClient({
        network: 'sepolia',
        privateKey: testPrivateKey,
        contractAddress: '0x1234567890123456789012345678901234567890',
      })

      const txHash = await client.revokeAttestation('0x' + '0'.repeat(64) as `0x${string}`, 'test reason')
      expect(txHash).toBe('0x' + 'e'.repeat(64))
    })
  })

  describe('read operations', () => {
    let client: PoHIClient

    beforeEach(() => {
      client = new PoHIClient({
        network: 'sepolia',
        contractAddress: '0x1234567890123456789012345678901234567890',
      })
    })

    it('getAttestation should call readContract and return formatted data', async () => {
      const { createPublicClient } = await import('viem')
      const mockAttestation = {
        attestationHash: '0x' + 'a'.repeat(64),
        repository: 'owner/repo',
        commitSha: '0x' + 'b'.repeat(64),
        nullifierHash: '0x' + 'c'.repeat(64),
        verificationLevel: 2,
        timestamp: BigInt(1234567890),
        revoked: false,
        recorder: '0x1234567890123456789012345678901234567890',
      }
      const mockReadContract = vi.fn().mockResolvedValue(mockAttestation)
      vi.mocked(createPublicClient).mockReturnValue({
        readContract: mockReadContract,
        waitForTransactionReceipt: vi.fn(),
      } as never)

      const newClient = new PoHIClient({
        network: 'sepolia',
        contractAddress: '0x1234567890123456789012345678901234567890',
      })

      const result = await newClient.getAttestation('0x' + 'a'.repeat(64) as `0x${string}`)

      expect(result.attestationHash).toBe(mockAttestation.attestationHash)
      expect(result.repository).toBe('owner/repo')
      expect(result.revoked).toBe(false)
      expect(result.timestamp).toBe(BigInt(1234567890))
    })

    it('isValidAttestation should return boolean from contract', async () => {
      const { createPublicClient } = await import('viem')
      const mockReadContract = vi.fn().mockResolvedValue(true)
      vi.mocked(createPublicClient).mockReturnValue({
        readContract: mockReadContract,
        waitForTransactionReceipt: vi.fn(),
      } as never)

      const newClient = new PoHIClient({
        network: 'sepolia',
        contractAddress: '0x1234567890123456789012345678901234567890',
      })

      const isValid = await newClient.isValidAttestation('0x' + 'a'.repeat(64) as `0x${string}`)
      expect(isValid).toBe(true)
    })

    it('getAttestationsForCommit should return array of hashes', async () => {
      const { createPublicClient } = await import('viem')
      const mockHashes = [
        '0x' + 'a'.repeat(64),
        '0x' + 'b'.repeat(64),
      ] as readonly `0x${string}`[]
      const mockReadContract = vi.fn().mockResolvedValue(mockHashes)
      vi.mocked(createPublicClient).mockReturnValue({
        readContract: mockReadContract,
        waitForTransactionReceipt: vi.fn(),
      } as never)

      const newClient = new PoHIClient({
        network: 'sepolia',
        contractAddress: '0x1234567890123456789012345678901234567890',
      })

      const hashes = await newClient.getAttestationsForCommit('owner/repo', 'abc123')
      expect(hashes).toHaveLength(2)
    })

    it('hasValidAttestation should return boolean', async () => {
      const { createPublicClient } = await import('viem')
      const mockReadContract = vi.fn().mockResolvedValue(true)
      vi.mocked(createPublicClient).mockReturnValue({
        readContract: mockReadContract,
        waitForTransactionReceipt: vi.fn(),
      } as never)

      const newClient = new PoHIClient({
        network: 'sepolia',
        contractAddress: '0x1234567890123456789012345678901234567890',
      })

      const hasValid = await newClient.hasValidAttestation('owner/repo', 'abc123')
      expect(hasValid).toBe(true)
    })

    it('getValidAttestationCount should return bigint', async () => {
      const { createPublicClient } = await import('viem')
      const mockReadContract = vi.fn().mockResolvedValue(BigInt(5))
      vi.mocked(createPublicClient).mockReturnValue({
        readContract: mockReadContract,
        waitForTransactionReceipt: vi.fn(),
      } as never)

      const newClient = new PoHIClient({
        network: 'sepolia',
        contractAddress: '0x1234567890123456789012345678901234567890',
      })

      const count = await newClient.getValidAttestationCount('owner/repo', 'abc123')
      expect(count).toBe(BigInt(5))
    })

    it('getAttestationsForNullifier should return array of hashes', async () => {
      const { createPublicClient } = await import('viem')
      const mockHashes = ['0x' + 'a'.repeat(64)] as readonly `0x${string}`[]
      const mockReadContract = vi.fn().mockResolvedValue(mockHashes)
      vi.mocked(createPublicClient).mockReturnValue({
        readContract: mockReadContract,
        waitForTransactionReceipt: vi.fn(),
      } as never)

      const newClient = new PoHIClient({
        network: 'sepolia',
        contractAddress: '0x1234567890123456789012345678901234567890',
      })

      const hashes = await newClient.getAttestationsForNullifier('0x' + 'c'.repeat(64) as `0x${string}`)
      expect(hashes).toHaveLength(1)
    })

    it('waitForTransaction should call waitForTransactionReceipt', async () => {
      const { createPublicClient } = await import('viem')
      const mockWaitForReceipt = vi.fn().mockResolvedValue({ status: 'success' })
      vi.mocked(createPublicClient).mockReturnValue({
        readContract: vi.fn(),
        waitForTransactionReceipt: mockWaitForReceipt,
      } as never)

      const newClient = new PoHIClient({
        network: 'sepolia',
        contractAddress: '0x1234567890123456789012345678901234567890',
      })

      await newClient.waitForTransaction('0x' + 'f'.repeat(64) as `0x${string}`)
      expect(mockWaitForReceipt).toHaveBeenCalledWith({ hash: '0x' + 'f'.repeat(64) })
    })
  })
})
