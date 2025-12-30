// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {PoHIRegistry} from "../src/PoHIRegistry.sol";

contract PoHIRegistryTest is Test {
    PoHIRegistry public registry;

    address public owner = address(0x1);
    address public recorder = address(0x2);
    address public admin = address(0x3);
    address public user = address(0x4);

    bytes32 public attestationHash = keccak256("test-attestation");
    string public repository = "owner/repo";
    bytes32 public commitSha = keccak256("abc123def456");
    bytes32 public nullifierHash = keccak256("nullifier-123");
    uint8 public verificationLevel = 1; // Orb

    function setUp() public {
        vm.prank(owner);
        registry = new PoHIRegistry();

        vm.prank(owner);
        registry.addAdmin(admin);
    }

    function test_RecordAttestation() public {
        vm.prank(recorder);
        bytes32 hash = registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        assertEq(hash, attestationHash);

        PoHIRegistry.Attestation memory attestation = registry.getAttestation(attestationHash);
        assertEq(attestation.attestationHash, attestationHash);
        assertEq(attestation.repository, repository);
        assertEq(attestation.commitSha, commitSha);
        assertEq(attestation.nullifierHash, nullifierHash);
        assertEq(attestation.verificationLevel, verificationLevel);
        assertEq(attestation.recorder, recorder);
        assertFalse(attestation.revoked);
    }

    function test_RecordAttestation_EmitsEvent() public {
        vm.expectEmit(true, true, true, true);
        emit PoHIRegistry.AttestationRecorded(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel, recorder
        );

        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );
    }

    function test_RecordAttestation_RevertsOnDuplicate() public {
        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        vm.prank(recorder);
        vm.expectRevert(PoHIRegistry.AttestationAlreadyExists.selector);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );
    }

    function test_RecordAttestation_RevertsOnDuplicateApproval() public {
        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        // Try to record another attestation for same commit with same nullifier
        bytes32 newAttestationHash = keccak256("new-attestation");
        vm.prank(recorder);
        vm.expectRevert(PoHIRegistry.DuplicateApproval.selector);
        registry.recordAttestation(
            newAttestationHash, repository, commitSha, nullifierHash, verificationLevel
        );
    }

    function test_RecordAttestation_AllowsDifferentNullifiers() public {
        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        // Different nullifier should work
        bytes32 newAttestationHash = keccak256("new-attestation");
        bytes32 newNullifier = keccak256("different-nullifier");
        vm.prank(recorder);
        registry.recordAttestation(newAttestationHash, repository, commitSha, newNullifier, verificationLevel);

        assertEq(registry.getValidAttestationCount(repository, commitSha), 2);
    }

    function test_IsValidAttestation() public {
        assertFalse(registry.isValidAttestation(attestationHash));

        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        assertTrue(registry.isValidAttestation(attestationHash));
    }

    function test_RevokeAttestation_ByRecorder() public {
        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        assertTrue(registry.isValidAttestation(attestationHash));

        vm.prank(recorder);
        registry.revokeAttestation(attestationHash, "Test revocation");

        assertFalse(registry.isValidAttestation(attestationHash));
    }

    function test_RevokeAttestation_ByAdmin() public {
        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        vm.prank(admin);
        registry.revokeAttestation(attestationHash, "Admin revocation");

        assertFalse(registry.isValidAttestation(attestationHash));
    }

    function test_RevokeAttestation_ByOwner() public {
        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        vm.prank(owner);
        registry.revokeAttestation(attestationHash, "Owner revocation");

        assertFalse(registry.isValidAttestation(attestationHash));
    }

    function test_RevokeAttestation_RevertsForUnauthorized() public {
        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        vm.prank(user);
        vm.expectRevert(PoHIRegistry.NotAuthorized.selector);
        registry.revokeAttestation(attestationHash, "Unauthorized");
    }

    function test_GetAttestationsForCommit() public {
        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        bytes32[] memory hashes = registry.getAttestationsForCommit(repository, commitSha);
        assertEq(hashes.length, 1);
        assertEq(hashes[0], attestationHash);
    }

    function test_GetAttestationsForNullifier() public {
        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        bytes32[] memory hashes = registry.getAttestationsForNullifier(nullifierHash);
        assertEq(hashes.length, 1);
        assertEq(hashes[0], attestationHash);
    }

    function test_HasValidAttestation() public {
        assertFalse(registry.hasValidAttestation(repository, commitSha));

        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        assertTrue(registry.hasValidAttestation(repository, commitSha));

        vm.prank(recorder);
        registry.revokeAttestation(attestationHash, "Revoked");

        assertFalse(registry.hasValidAttestation(repository, commitSha));
    }

    function test_AddAdmin() public {
        address newAdmin = address(0x5);

        vm.prank(owner);
        registry.addAdmin(newAdmin);

        assertTrue(registry.admins(newAdmin));
    }

    function test_AddAdmin_RevertsForNonOwner() public {
        address newAdmin = address(0x5);

        vm.prank(user);
        vm.expectRevert(PoHIRegistry.NotAuthorized.selector);
        registry.addAdmin(newAdmin);
    }

    function test_TransferOwnership() public {
        address newOwner = address(0x5);

        vm.prank(owner);
        registry.transferOwnership(newOwner);

        assertEq(registry.owner(), newOwner);
    }

    // ============ Additional Edge Case Tests ============

    function test_RecordAttestation_RevertsOnZeroAttestationHash() public {
        vm.prank(recorder);
        vm.expectRevert(PoHIRegistry.InvalidInput.selector);
        registry.recordAttestation(
            bytes32(0), repository, commitSha, nullifierHash, verificationLevel
        );
    }

    function test_RecordAttestation_RevertsOnEmptyRepository() public {
        vm.prank(recorder);
        vm.expectRevert(PoHIRegistry.InvalidInput.selector);
        registry.recordAttestation(
            attestationHash, "", commitSha, nullifierHash, verificationLevel
        );
    }

    function test_RecordAttestation_RevertsOnZeroCommitSha() public {
        vm.prank(recorder);
        vm.expectRevert(PoHIRegistry.InvalidInput.selector);
        registry.recordAttestation(
            attestationHash, repository, bytes32(0), nullifierHash, verificationLevel
        );
    }

    function test_RecordAttestation_RevertsOnZeroNullifierHash() public {
        vm.prank(recorder);
        vm.expectRevert(PoHIRegistry.InvalidInput.selector);
        registry.recordAttestation(
            attestationHash, repository, commitSha, bytes32(0), verificationLevel
        );
    }

    function test_RevokeAttestation_RevertsOnNonExistentAttestation() public {
        bytes32 nonExistent = keccak256("non-existent");

        vm.prank(recorder);
        vm.expectRevert(PoHIRegistry.AttestationNotFound.selector);
        registry.revokeAttestation(nonExistent, "Does not exist");
    }

    function test_RevokeAttestation_RevertsOnAlreadyRevoked() public {
        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        vm.prank(recorder);
        registry.revokeAttestation(attestationHash, "First revocation");

        vm.prank(recorder);
        vm.expectRevert(PoHIRegistry.AttestationAlreadyRevoked.selector);
        registry.revokeAttestation(attestationHash, "Second revocation");
    }

    function test_RevokeAttestation_EmitsEvent() public {
        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        vm.expectEmit(true, false, false, true);
        emit PoHIRegistry.AttestationRevoked(attestationHash, "Test reason", recorder);

        vm.prank(recorder);
        registry.revokeAttestation(attestationHash, "Test reason");
    }

    function test_GetAttestation_RevertsOnNonExistent() public {
        bytes32 nonExistent = keccak256("non-existent");

        vm.expectRevert(PoHIRegistry.AttestationNotFound.selector);
        registry.getAttestation(nonExistent);
    }

    function test_GetValidAttestationCount_ReturnsZeroForNonExistent() public {
        uint256 count = registry.getValidAttestationCount("nonexistent/repo", commitSha);
        assertEq(count, 0);
    }

    function test_GetValidAttestationCount_ExcludesRevokedAttestations() public {
        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        bytes32 anotherAttestation = keccak256("another");
        bytes32 anotherNullifier = keccak256("another-nullifier");

        vm.prank(recorder);
        registry.recordAttestation(
            anotherAttestation, repository, commitSha, anotherNullifier, verificationLevel
        );

        assertEq(registry.getValidAttestationCount(repository, commitSha), 2);

        vm.prank(recorder);
        registry.revokeAttestation(attestationHash, "Revoked");

        assertEq(registry.getValidAttestationCount(repository, commitSha), 1);
    }

    function test_HasValidAttestation_ReturnsFalseWhenAllRevoked() public {
        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        assertTrue(registry.hasValidAttestation(repository, commitSha));

        vm.prank(recorder);
        registry.revokeAttestation(attestationHash, "Revoked");

        assertFalse(registry.hasValidAttestation(repository, commitSha));
    }

    function test_RemoveAdmin() public {
        vm.prank(owner);
        registry.addAdmin(admin);
        assertTrue(registry.admins(admin));

        vm.prank(owner);
        registry.removeAdmin(admin);
        assertFalse(registry.admins(admin));
    }

    function test_RemoveAdmin_RevertsForNonOwner() public {
        vm.prank(user);
        vm.expectRevert(PoHIRegistry.NotAuthorized.selector);
        registry.removeAdmin(admin);
    }

    function test_AddAdmin_RevertsOnZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(PoHIRegistry.InvalidInput.selector);
        registry.addAdmin(address(0));
    }

    function test_TransferOwnership_RevertsOnZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(PoHIRegistry.InvalidInput.selector);
        registry.transferOwnership(address(0));
    }

    function test_TransferOwnership_RevertsForNonOwner() public {
        vm.prank(user);
        vm.expectRevert(PoHIRegistry.NotAuthorized.selector);
        registry.transferOwnership(user);
    }

    function test_TransferOwnership_EmitsEvent() public {
        address newOwner = address(0x5);

        vm.expectEmit(true, true, false, false);
        emit PoHIRegistry.OwnershipTransferred(owner, newOwner);

        vm.prank(owner);
        registry.transferOwnership(newOwner);
    }

    function test_AddAdmin_EmitsEvent() public {
        address newAdmin = address(0x5);

        vm.expectEmit(true, false, false, false);
        emit PoHIRegistry.AdminAdded(newAdmin);

        vm.prank(owner);
        registry.addAdmin(newAdmin);
    }

    function test_RemoveAdmin_EmitsEvent() public {
        vm.expectEmit(true, false, false, false);
        emit PoHIRegistry.AdminRemoved(admin);

        vm.prank(owner);
        registry.removeAdmin(admin);
    }

    function test_MultipleAttestationsForSameCommit() public {
        // Record first attestation
        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        // Record second attestation with different nullifier
        bytes32 hash2 = keccak256("hash2");
        bytes32 nullifier2 = keccak256("nullifier2");
        vm.prank(recorder);
        registry.recordAttestation(hash2, repository, commitSha, nullifier2, verificationLevel);

        // Record third attestation with different nullifier
        bytes32 hash3 = keccak256("hash3");
        bytes32 nullifier3 = keccak256("nullifier3");
        vm.prank(recorder);
        registry.recordAttestation(hash3, repository, commitSha, nullifier3, verificationLevel);

        bytes32[] memory hashes = registry.getAttestationsForCommit(repository, commitSha);
        assertEq(hashes.length, 3);
        assertEq(hashes[0], attestationHash);
        assertEq(hashes[1], hash2);
        assertEq(hashes[2], hash3);
    }

    function test_SameNullifierDifferentCommits() public {
        // Same user can approve different commits
        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        bytes32 newCommit = keccak256("different-commit");
        bytes32 newAttestation = keccak256("new-attestation");
        vm.prank(recorder);
        registry.recordAttestation(
            newAttestation, repository, newCommit, nullifierHash, verificationLevel
        );

        bytes32[] memory nullifierAttestations = registry.getAttestationsForNullifier(nullifierHash);
        assertEq(nullifierAttestations.length, 2);
    }

    function test_DifferentRepositoriesSameCommit() public {
        // Same commit SHA in different repos should work
        vm.prank(recorder);
        registry.recordAttestation(
            attestationHash, repository, commitSha, nullifierHash, verificationLevel
        );

        string memory repo2 = "different/repo";
        bytes32 hash2 = keccak256("hash2");
        vm.prank(recorder);
        registry.recordAttestation(hash2, repo2, commitSha, nullifierHash, verificationLevel);

        // Each should have their own attestation
        bytes32[] memory repo1Hashes = registry.getAttestationsForCommit(repository, commitSha);
        bytes32[] memory repo2Hashes = registry.getAttestationsForCommit(repo2, commitSha);

        assertEq(repo1Hashes.length, 1);
        assertEq(repo2Hashes.length, 1);
    }

    function test_VerificationLevelStoredCorrectly() public {
        // Test device level (0)
        bytes32 deviceHash = keccak256("device-attestation");
        vm.prank(recorder);
        registry.recordAttestation(deviceHash, repository, commitSha, nullifierHash, 0);

        PoHIRegistry.Attestation memory deviceAttestation = registry.getAttestation(deviceHash);
        assertEq(deviceAttestation.verificationLevel, 0);

        // Test orb level (1)
        bytes32 orbHash = keccak256("orb-attestation");
        bytes32 orbNullifier = keccak256("orb-nullifier");
        vm.prank(recorder);
        registry.recordAttestation(orbHash, repository, commitSha, orbNullifier, 1);

        PoHIRegistry.Attestation memory orbAttestation = registry.getAttestation(orbHash);
        assertEq(orbAttestation.verificationLevel, 1);
    }
}
