import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MyContractProxyModule = buildModule("MyContractProxyModule", (m) => {
    // Получаем аккаунт для развертывания
    const deployer = m.getAccount(0);

    // Разворачиваем MyContractV1
    const myContractV1 = m.contract("MyContractV1");

    // Кодируем вызов функции initialize для инициализации контракта
    const initializeData = m.encodeFunctionCall(myContractV1, "initialize", [
        deployer,
    ]);

    // Разворачиваем прокси-контракт с MyContractV1 в качестве начальной реализации
    const proxy = m.contract(
        "MyContractProxy",
        [myContractV1, initializeData] // Передаем адрес логического контракта и закодированные данные
    );

    // Опционально разворачиваем MyContractV2 для последующего обновления
    const myContractV2 = m.contract("MyContractV2");

    return { proxy, myContractV1, myContractV2 };
});

export default MyContractProxyModule;
