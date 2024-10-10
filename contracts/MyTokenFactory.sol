// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/proxy/Clones.sol";
// import "./MyTokenUpgradeable.sol";

// contract MyTokenFactory {
//     address public implementation;

//     event TokenCreated(address indexed owner, address indexed tokenAddress);

//     constructor(address _implementation) {
//         implementation = _implementation;
//     }

//     function createToken(string memory name, string memory symbol) external returns (address) {
//         address clone = Clones.clone(implementation);
//         MyTokenUpgradeable(clone).initialize(name, symbol);
//         MyTokenUpgradeable(clone).transferOwnership(msg.sender);

//         emit TokenCreated(msg.sender, clone);
//         return clone;
//     }
// }
