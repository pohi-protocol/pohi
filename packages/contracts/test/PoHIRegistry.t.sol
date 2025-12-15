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
}
