// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// contract MyTokenUpgradeable is ERC20PermitUpgradeable, UUPSUpgradeable, OwnableUpgradeable {
//     function initialize(string memory name, string memory symbol) public initializer {
//         __ERC20_init(name, symbol);
//         __ERC20Permit_init(name);
//         __Ownable_init();
//         _mint(msg.sender, 1_000_000 * 10 ** decimals());
//     }

//     // Функция для выпуска новых токенов
//     function mint(address to, uint256 amount) external onlyOwner {
//         _mint(to, amount);
//     }

//     // Обязательная функция авторизации для UUPS
//     function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
// }
