// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMotoWorkshop {

    // Используем storage для хранения данных о мотоциклах в блокчейне.
    struct Motorcycle {
      string model;
      uint128 mileage;
    }

    function addMotorcycle(string calldata model, uint128 mileage) external;

    function updateMileage(uint128 index, uint128 newMileage) external;

    function calculateRepairCost(uint128[] memory partsCosts) external pure returns (uint256 totalCost);

    function getMotorcycle(uint128 index) external view returns (Motorcycle memory);
}
