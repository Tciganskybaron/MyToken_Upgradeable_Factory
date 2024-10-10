// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IMotoWorkshop.sol";

contract MotoWorkshop is IMotoWorkshop {

    // Переменная типа storage для хранения мотоциклов, которые были отремонтированы.
    Motorcycle[] public repairedMotorcycles;

		// Используем storage для хранения данных о имени мотоцентра
	  string public name;

	  constructor(string memory name_) {
        name = name_;
    }

		/**
    * @dev Добавление нового мотоцикла в список отремонтированных (используем calldata для экономии газа).
    */ 
    function addMotorcycle(string calldata model, uint128 mileage) external {
        require(bytes(model).length != 0, "Model cannot be empty");
        require(mileage > 0, "Mileage must be greater than 0");

        // Создаем новый мотоцикл в памяти, чтобы минимизировать газ
        Motorcycle memory newMotorcycle = Motorcycle(model, mileage);
        repairedMotorcycles.push(newMotorcycle); // Записываем данные в storage
    }

    /**
    * @dev  Функция для обновления пробега у мотоцикла (используем storage).
    */ 
    function updateMileage(uint128 index, uint128 newMileage) external {
        require(index < repairedMotorcycles.length, "Invalid index");
        require(newMileage > 0, "Mileage zero");

        // Доступ к данным в storage, так как это изменяемые данные на блокчейне
        Motorcycle storage motorcycle = repairedMotorcycles[index];
        motorcycle.mileage = newMileage; // Изменяем данные на блокчейне
    }

    /**
    * @dev  Функция для вычисления стоимости ремонта (используем memory для временных вычислений).
    */ 
    function calculateRepairCost(uint128[] memory partsCosts) public pure returns (uint256 totalCost) {
			  require(partsCosts.length > 0, "partsCosts cannot be empty");

        // Используем stack для работы с переменной totalCost, так как это простая операция.
        for (uint128 i = 0; i < partsCosts.length; i++) {
            totalCost += partsCosts[i]; // Стек используется для временного хранения промежуточных данных
        }
    }

    /**
    * @dev  Получение информации о мотоцикле по индексу (используем memory для возвращаемых данных).
    */ 
    function getMotorcycle(uint128 index) external view returns (Motorcycle memory) {
			  require(index < repairedMotorcycles.length, "Invalid index");
        return repairedMotorcycles[index]; // Возвращаем данные через memory
    }
}
