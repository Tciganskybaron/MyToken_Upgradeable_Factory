// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// contract MetaTransactionHandler is ERC2771Context, Ownable {
//     constructor(address forwarder) ERC2771Context(forwarder) {}

//     // Пример функции, которую можно вызвать через мета-транзакцию
//     function execute(address target, bytes calldata data) external onlyOwner {
//         (bool success, ) = target.call(data);
//         require(success, "Call failed");
//     }

//     // Переопределяем _msgSender() для корректного определения инициатора транзакции
//     function _msgSender() internal view override(Context, ERC2771Context) returns (address sender) {
//         sender = ERC2771Context._msgSender();
//     }

//     function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
//         return ERC2771Context._msgData();
//     }
// }
