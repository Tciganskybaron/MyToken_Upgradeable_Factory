// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(string memory _name, string memory _ticker, uint256 _supply) ERC20(_name, _ticker) {
      _mint(msg.sender, _supply);
    }
}

contract Factory {
	  address public owner;
    address[] public tokens;
    uint256 public tokenCount;

	  constructor()
    {
			  owner = msg.sender;
    }
	
    event TokenDeployed(address tokenAddress);

    function deployToken(string calldata _name, string calldata _ticker, uint256 _supply) public onlyOwner returns (address){
        Token token = new Token(_name, _ticker, _supply);
        token.transfer(msg.sender, _supply);
        tokens.push(address(token));
        tokenCount += 1;
        emit TokenDeployed(address(token));
        return address(token);
    }

		modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
}
