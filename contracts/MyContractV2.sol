// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MyContractV2 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 public value;

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        value = 6897;
    }

    function setValue(uint256 newValue) public onlyOwner {
        value = newValue;
    }

    function getValue() public view returns (uint256) {
        return value;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function upgrade(address newImplementation) public onlyOwner {
        upgradeToAndCall(newImplementation, "");
    }
}
