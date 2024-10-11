import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { parseUnits, getEventSelector } from "viem";

describe("Token Factory", function () {
    // Фикстура для развертывания фабрики
    async function deployFactoryFixture() {
        const [owner, otherAccount] = await hre.viem.getWalletClients();

        // Разворачиваем контракт фабрики
        const factory = await hre.viem.deployContract("Factory", []);

        const publicClient = await hre.viem.getPublicClient();
        const walletClient = await hre.viem.getWalletClient(
            owner.account.address
        );

        return { factory, owner, otherAccount, publicClient, walletClient };
    }

    describe("Token Deployment", function () {
        it("Should deploy a new token and assign the supply to the deployer", async function () {
            const { factory, owner, publicClient } =
                await loadFixture(deployFactoryFixture);

            // Задаем параметры для токена
            const name = "TestToken";
            const ticker = "TTK";
            const supply = parseUnits("1000", 18);

            // Вызываем функцию deployToken и развертываем токен через фабрику
            const hash = await factory.write.deployToken(
                [name, ticker, supply],
                {
                    account: owner.account.address,
                }
            );

            // Ждем квитанцию транзакции
            const receipt = await publicClient.waitForTransactionReceipt({
                hash,
            });

            // Получаем селектор события `TokenDeployed`
            const tokenDeployedSelector = getEventSelector(
                "TokenDeployed(address)"
            );

            // Находим лог события `TokenDeployed`
            const event = receipt.logs.find(
                (log) =>
                    log.address === factory.address &&
                    log.topics[0] === tokenDeployedSelector
            );

            if (!event) {
                throw new Error("TokenDeployed event not found");
            }

            // Извлекаем адрес токена из данных события (убираем 12 байт префикса)
            const tokenAddress = `0x${event.data.slice(26)}`;

            // Получаем контракт токена по его адресу
            const token = await hre.viem.getContractAt(
                "Token",
                tokenAddress as `0x${string}`,
                {
                    client: { wallet: owner },
                }
            );

            // Проверяем, что токен был развернут с правильным названием, тикером и балансом владельца
            expect(await token.read.name()).to.equal(name);
            expect(await token.read.symbol()).to.equal(ticker);
            const balance = await token.read.balanceOf([owner.account.address]);
            expect(balance).to.equal(supply);
        });

        it("Should allow the factory to keep track of deployed tokens", async function () {
            const { factory, owner, publicClient } =
                await loadFixture(deployFactoryFixture);

            // Разворачиваем два токена
            const firstHash = await factory.write.deployToken(
                ["TokenA", "TKNA", parseUnits("500", 18)],
                {
                    account: owner.account.address,
                }
            );

            const secondHash = await factory.write.deployToken(
                ["TokenB", "TKNB", parseUnits("1000", 18)],
                {
                    account: owner.account.address,
                }
            );

            // Ждем квитанции для обоих токенов
            await publicClient.waitForTransactionReceipt({ hash: firstHash });
            await publicClient.waitForTransactionReceipt({ hash: secondHash });

            // Проверяем, что factory содержит два токена
            const tokenCount = await factory.read.tokenCount();
            expect(tokenCount).to.equal(2n);

            const firstTokenAddress = await factory.read.tokens([BigInt(0)]);
            const secondTokenAddress = await factory.read.tokens([BigInt(1)]);

            // Проверяем, что оба адреса являются корректными адресами
            expect(firstTokenAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
            expect(secondTokenAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
        });

        it("Should not allow non-owner to deploy a token", async function () {
            const { factory, otherAccount } =
                await loadFixture(deployFactoryFixture);

            // Задаем параметры для токена
            const name = "UnauthorizedToken";
            const ticker = "UNAUTH";
            const supply = parseUnits("1000", 18);

            // Попытка развернуть токен от имени другого аккаунта
            await expect(
                factory.write.deployToken([name, ticker, supply], {
                    account: otherAccount.account.address,
                })
            ).to.be.rejectedWith("Only owner can call this function");
        });
    });
});
