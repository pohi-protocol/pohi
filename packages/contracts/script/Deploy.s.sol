// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {PoHIRegistry} from "../src/PoHIRegistry.sol";

contract DeployScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying PoHIRegistry...");
        console.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        PoHIRegistry registry = new PoHIRegistry();

        vm.stopBroadcast();

        console.log("PoHIRegistry deployed at:", address(registry));
        console.log("Owner:", registry.owner());
    }
}
