/**
 * PoHIRegistry contract ABI
 */
export const pohiRegistryAbi = [
  // Events
  {
    type: 'event',
    name: 'AttestationRecorded',
    inputs: [
      { name: 'attestationHash', type: 'bytes32', indexed: true },
      { name: 'repository', type: 'string', indexed: false },
      { name: 'commitSha', type: 'bytes32', indexed: true },
      { name: 'nullifierHash', type: 'bytes32', indexed: true },
      { name: 'verificationLevel', type: 'uint8', indexed: false },
      { name: 'recorder', type: 'address', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'AttestationRevoked',
    inputs: [
      { name: 'attestationHash', type: 'bytes32', indexed: true },
      { name: 'reason', type: 'string', indexed: false },
      { name: 'revokedBy', type: 'address', indexed: false },
    ],
  },

  // Errors
  { type: 'error', name: 'AttestationAlreadyExists', inputs: [] },
  { type: 'error', name: 'AttestationNotFound', inputs: [] },
  { type: 'error', name: 'AttestationAlreadyRevoked', inputs: [] },
  { type: 'error', name: 'NotAuthorized', inputs: [] },
  { type: 'error', name: 'InvalidInput', inputs: [] },
  { type: 'error', name: 'DuplicateApproval', inputs: [] },

  // Read functions
  {
    type: 'function',
    name: 'attestations',
    inputs: [{ name: '', type: 'bytes32' }],
    outputs: [
      { name: 'attestationHash', type: 'bytes32' },
      { name: 'repository', type: 'string' },
      { name: 'commitSha', type: 'bytes32' },
      { name: 'nullifierHash', type: 'bytes32' },
      { name: 'verificationLevel', type: 'uint8' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'revoked', type: 'bool' },
      { name: 'recorder', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAttestation',
    inputs: [{ name: 'attestationHash', type: 'bytes32' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'attestationHash', type: 'bytes32' },
          { name: 'repository', type: 'string' },
          { name: 'commitSha', type: 'bytes32' },
          { name: 'nullifierHash', type: 'bytes32' },
          { name: 'verificationLevel', type: 'uint8' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'revoked', type: 'bool' },
          { name: 'recorder', type: 'address' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isValidAttestation',
    inputs: [{ name: 'attestationHash', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAttestationsForCommit',
    inputs: [
      { name: 'repository', type: 'string' },
      { name: 'commitSha', type: 'bytes32' },
    ],
    outputs: [{ name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAttestationsForNullifier',
    inputs: [{ name: 'nullifierHash', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasValidAttestation',
    inputs: [
      { name: 'repository', type: 'string' },
      { name: 'commitSha', type: 'bytes32' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getValidAttestationCount',
    inputs: [
      { name: 'repository', type: 'string' },
      { name: 'commitSha', type: 'bytes32' },
    ],
    outputs: [{ name: 'count', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'admins',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },

  // Write functions
  {
    type: 'function',
    name: 'recordAttestation',
    inputs: [
      { name: 'attestationHash', type: 'bytes32' },
      { name: 'repository', type: 'string' },
      { name: 'commitSha', type: 'bytes32' },
      { name: 'nullifierHash', type: 'bytes32' },
      { name: 'verificationLevel', type: 'uint8' },
    ],
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeAttestation',
    inputs: [
      { name: 'attestationHash', type: 'bytes32' },
      { name: 'reason', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addAdmin',
    inputs: [{ name: 'admin', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeAdmin',
    inputs: [{ name: 'admin', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [{ name: 'newOwner', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const
