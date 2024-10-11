import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { encodeFunctionData } from "viem";

describe("MyContract Proxy with UUPS Upgradeability", function () {
    // Фикстура для развертывания прокси и логического контракта
    async function deployProxyFixture() {
        // Получаем клиентов (кошельки) для владельца и другого аккаунта
        const [owner, otherAccount] = await hre.viem.getWalletClients();

        // Разворачиваем MyContractV1, который будет начальной логикой
        const myContractV1 = await hre.viem.deployContract("MyContractV1", []);

        // Кодируем вызов функции initialize с адресом владельца с помощью viem
        const initializeData = encodeFunctionData({
            abi: myContractV1.abi, // ABI контракта
            functionName: "initialize", // Имя функции, которую хотим вызвать
            args: [owner.account.address], // Аргументы для вызова (адрес владельца)
        });

        // Разворачиваем прокси MyContractProxy, указывая адрес MyContractV1 и данные инициализации
        const proxy = await hre.viem.deployContract("MyContractProxy", [
            myContractV1.address, // Адрес логического контракта
            initializeData, // Данные инициализации
        ]);

        // Получаем экземпляр прокси, взаимодействуя с ним как с MyContractV1
        const proxyAsV1 = await hre.viem.getContractAt(
            "MyContractV1", // ABI контракта V1
            proxy.address, // Адрес прокси
            { client: { wallet: owner } } // Клиент для взаимодействия (владельца)
        );

        // Получаем публичный клиент (для чтения данных) и клиент кошелька
        const publicClient = await hre.viem.getPublicClient();
        const walletClient = await hre.viem.getWalletClient(
            owner.account.address
        );

        // Возвращаем все созданные объекты для использования в тестах
        return {
            owner,
            otherAccount,
            myContractV1,
            proxy,
            proxyAsV1,
            publicClient,
            walletClient,
        };
    }

    describe("Initialization", function () {
        it.only("Should initialize MyContractV1 through proxy", async function () {
            const { proxyAsV1 } = await loadFixture(deployProxyFixture);

            // Проверяем, что начальное значение переменной value равно 0
            const value = await proxyAsV1.read.getValue();
            expect(value).to.equal(BigInt(0));
        });
    });

    describe("Proxy interaction with MyContractV1", function () {
        it.only("Should set and get the value correctly through proxy", async function () {
            const { proxyAsV1, owner } = await loadFixture(deployProxyFixture);

            // Устанавливаем новое значение через прокси
            const newValue = BigInt(42);
            await expect(
                proxyAsV1.write.setValue([newValue], {
                    account: owner.account.address, // Указываем владельца как отправителя
                })
            ).to.be.fulfilled;

            // Проверяем, что значение установлено корректно
            const value = await proxyAsV1.read.getValue();
            expect(value).to.equal(newValue);
        });
    });

    describe("Upgrade to MyContractV2", function () {
        it.only("Should upgrade proxy to MyContractV2 and retain state", async function () {
            const { proxy, owner, proxyAsV1 } =
                await loadFixture(deployProxyFixture);

            // Устанавливаем начальное значение в V1
            const initialValue = BigInt(123);
            await proxyAsV1.write.setValue([initialValue], {
                account: owner.account.address,
            });

            // Разворачиваем MyContractV2, чтобы обновить прокси
            const myContractV2 = await hre.viem.deployContract(
                "MyContractV2",
                []
            );

            // Получаем экземпляр прокси, взаимодействуя с ним как с MyContractV2
            const proxyAsV2 = await hre.viem.getContractAt(
                "MyContractV2",
                proxy.address,
                { client: { wallet: owner } }
            );

            // Обновляем прокси до версии MyContractV2
            await expect(
                proxyAsV2.write.upgrade([myContractV2.address], {
                    account: owner.account.address,
                })
            ).to.be.fulfilled;

            // Проверяем, что значение переменной сохранилось после обновления
            const valueAfterUpgrade = await proxyAsV2.read.getValue();
            expect(valueAfterUpgrade).to.equal(initialValue);

            // Проверяем, что новая функциональность в MyContractV2 доступна
            const newV2Value = BigInt(6897);
            await expect(
                proxyAsV2.write.setValue({
                    account: owner.account.address,
                })
            ).to.be.fulfilled;

            // Проверяем, что новое значение установлено корректно
            const valueInV2 = await proxyAsV2.read.getValue();
            expect(valueInV2).to.equal(newV2Value);
        });

        it.only("Should only allow the owner to upgrade the contract", async function () {
            const { proxy, otherAccount } =
                await loadFixture(deployProxyFixture);

            // Разворачиваем MyContractV2
            const myContractV2 = await hre.viem.deployContract(
                "MyContractV2",
                []
            );

            // Получаем экземпляр прокси, взаимодействуя с ним как с MyContractV2 от имени другого аккаунта
            const proxyAsV2 = await hre.viem.getContractAt(
                "MyContractV2",
                proxy.address,
                { client: { wallet: otherAccount } }
            );

            // Пытаемся обновить контракт от имени другого аккаунта, ожидаем ошибку
            await expect(
                proxyAsV2.write.upgrade([myContractV2.address], {
                    account: otherAccount.account.address,
                })
            ).to.be.rejectedWith("OwnableUnauthorizedAccount");
        });
    });
});
