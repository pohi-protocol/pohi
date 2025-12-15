// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

/**
 * @title PoHIRegistry
 * @notice On-chain registry for Proof of Human Intent attestations
 * @dev Stores attestations linking World ID verifications to software commits
 */
contract PoHIRegistry {
    // ============ Structs ============

    struct Attestation {
        bytes32 attestationHash;
        string repository;
        bytes32 commitSha;
        bytes32 nullifierHash;
        uint8 verificationLevel; // 0 = Device, 1 = Orb
        uint256 timestamp;
        bool revoked;
        address recorder;
    }

    // ============ State Variables ============

    /// @notice Mapping from attestation hash to attestation data
    mapping(bytes32 => Attestation) public attestations;

    /// @notice Mapping from commit key (repo + sha) to attestation hashes
    mapping(bytes32 => bytes32[]) public commitAttestations;

    /// @notice Mapping from nullifier to attestation hashes (for Sybil detection)
    mapping(bytes32 => bytes32[]) public nullifierAttestations;

    /// @notice Mapping of admin addresses
    mapping(address => bool) public admins;

    /// @notice Owner address
    address public owner;

    // ============ Events ============

    event AttestationRecorded(
        bytes32 indexed attestationHash,
        string repository,
        bytes32 indexed commitSha,
        bytes32 indexed nullifierHash,
        uint8 verificationLevel,
        address recorder
    );

    event AttestationRevoked(bytes32 indexed attestationHash, string reason, address revokedBy);

    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ============ Errors ============

    error AttestationAlreadyExists();
    error AttestationNotFound();
    error AttestationAlreadyRevoked();
    error NotAuthorized();
    error InvalidInput();
    error DuplicateApproval();

    // ============ Modifiers ============

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotAuthorized();
        _;
    }

    modifier onlyAdminOrOwner() {
        if (msg.sender != owner && !admins[msg.sender]) revert NotAuthorized();
        _;
    }

    // ============ Constructor ============

    constructor() {
        owner = msg.sender;
    }

    // ============ External Functions ============

    /**
     * @notice Record a new attestation on-chain
     * @param attestationHash The unique hash identifying this attestation
     * @param repository The repository identifier (e.g., "owner/repo")
     * @param commitSha The commit SHA being attested (as bytes32)
     * @param nullifierHash The World ID nullifier hash
     * @param verificationLevel The verification level (0=Device, 1=Orb)
     * @return The attestation hash
     */
    function recordAttestation(
        bytes32 attestationHash,
        string calldata repository,
        bytes32 commitSha,
        bytes32 nullifierHash,
        uint8 verificationLevel
    ) external returns (bytes32) {
        if (attestationHash == bytes32(0)) revert InvalidInput();
        if (bytes(repository).length == 0) revert InvalidInput();
        if (commitSha == bytes32(0)) revert InvalidInput();
        if (nullifierHash == bytes32(0)) revert InvalidInput();

        // Check if attestation already exists
        if (attestations[attestationHash].timestamp != 0) {
            revert AttestationAlreadyExists();
        }

        // Check for duplicate approval (same nullifier + commit)
        bytes32 commitKey = keccak256(abi.encodePacked(repository, commitSha));
        bytes32[] storage existing = commitAttestations[commitKey];
        for (uint256 i = 0; i < existing.length; i++) {
            if (attestations[existing[i]].nullifierHash == nullifierHash) {
                revert DuplicateApproval();
            }
        }

        // Store the attestation
        attestations[attestationHash] = Attestation({
            attestationHash: attestationHash,
            repository: repository,
            commitSha: commitSha,
            nullifierHash: nullifierHash,
            verificationLevel: verificationLevel,
            timestamp: block.timestamp,
            revoked: false,
            recorder: msg.sender
        });

        // Index by commit
        commitAttestations[commitKey].push(attestationHash);

        // Index by nullifier
        nullifierAttestations[nullifierHash].push(attestationHash);

        emit AttestationRecorded(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel, msg.sender
        );

        return attestationHash;
    }

    /**
     * @notice Revoke an attestation
     * @param attestationHash The attestation to revoke
     * @param reason The reason for revocation
     */
    function revokeAttestation(bytes32 attestationHash, string calldata reason) external {
        Attestation storage attestation = attestations[attestationHash];

        if (attestation.timestamp == 0) revert AttestationNotFound();
        if (attestation.revoked) revert AttestationAlreadyRevoked();

        // Only recorder or admin/owner can revoke
        if (msg.sender != attestation.recorder && msg.sender != owner && !admins[msg.sender]) {
            revert NotAuthorized();
        }

        attestation.revoked = true;

        emit AttestationRevoked(attestationHash, reason, msg.sender);
    }

    /**
     * @notice Get attestation details
     * @param attestationHash The attestation hash to lookup
     * @return The attestation data
     */
    function getAttestation(bytes32 attestationHash) external view returns (Attestation memory) {
        Attestation memory attestation = attestations[attestationHash];
        if (attestation.timestamp == 0) revert AttestationNotFound();
        return attestation;
    }

    /**
     * @notice Check if an attestation is valid (exists and not revoked)
     * @param attestationHash The attestation hash to check
     * @return bool Whether the attestation is valid
     */
    function isValidAttestation(bytes32 attestationHash) external view returns (bool) {
        Attestation memory attestation = attestations[attestationHash];
        return attestation.timestamp != 0 && !attestation.revoked;
    }

    /**
     * @notice Get all attestation hashes for a specific commit
     * @param repository The repository identifier
     * @param commitSha The commit SHA
     * @return Array of attestation hashes
     */
    function getAttestationsForCommit(string calldata repository, bytes32 commitSha)
        external
        view
        returns (bytes32[] memory)
    {
        bytes32 commitKey = keccak256(abi.encodePacked(repository, commitSha));
        return commitAttestations[commitKey];
    }

    /**
     * @notice Get all attestation hashes for a nullifier
     * @param nullifierHash The nullifier hash
     * @return Array of attestation hashes
     */
    function getAttestationsForNullifier(bytes32 nullifierHash)
        external
        view
        returns (bytes32[] memory)
    {
        return nullifierAttestations[nullifierHash];
    }

    /**
     * @notice Check if a commit has any valid attestations
     * @param repository The repository identifier
     * @param commitSha The commit SHA
     * @return bool Whether the commit has valid attestations
     */
    function hasValidAttestation(string calldata repository, bytes32 commitSha)
        external
        view
        returns (bool)
    {
        bytes32 commitKey = keccak256(abi.encodePacked(repository, commitSha));
        bytes32[] memory hashes = commitAttestations[commitKey];

        for (uint256 i = 0; i < hashes.length; i++) {
            Attestation memory a = attestations[hashes[i]];
            if (!a.revoked) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Get the count of valid attestations for a commit
     * @param repository The repository identifier
     * @param commitSha The commit SHA
     * @return count The number of valid attestations
     */
    function getValidAttestationCount(string calldata repository, bytes32 commitSha)
        external
        view
        returns (uint256 count)
    {
        bytes32 commitKey = keccak256(abi.encodePacked(repository, commitSha));
        bytes32[] memory hashes = commitAttestations[commitKey];

        for (uint256 i = 0; i < hashes.length; i++) {
            if (!attestations[hashes[i]].revoked) {
                count++;
            }
        }
    }

    // ============ Admin Functions ============

    /**
     * @notice Add an admin
     * @param admin The address to add as admin
     */
    function addAdmin(address admin) external onlyOwner {
        if (admin == address(0)) revert InvalidInput();
        admins[admin] = true;
        emit AdminAdded(admin);
    }

    /**
     * @notice Remove an admin
     * @param admin The address to remove
     */
    function removeAdmin(address admin) external onlyOwner {
        admins[admin] = false;
        emit AdminRemoved(admin);
    }

    /**
     * @notice Transfer ownership
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidInput();
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }
}
