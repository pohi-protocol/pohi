import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PoHIClient, type PoHIClientConfig } from './client'
import { worldChain, worldChainSepolia } from './chains'

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
})
