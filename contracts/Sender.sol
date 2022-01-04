//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Sender {
    constructor(address[] memory targets) payable {
        uint numTargets = targets.length;
        uint amountPerTarget = msg.value / numTargets;

        for (uint i = 0; i < numTargets; i++) {
            payable(targets[i]).transfer(amountPerTarget);
        }
    }
}
