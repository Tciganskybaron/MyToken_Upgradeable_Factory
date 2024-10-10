// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract MyToken is ERC20Permit {
	  address public owner;

    constructor(string memory name, string memory symbol)
        ERC20(name, symbol)
        ERC20Permit(name)
    {
			  owner = msg.sender;
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

		modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
}
