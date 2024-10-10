import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { parseUnits } from "viem";

describe("MyToken (ERC20Permit)", function () {
    async function deployTokenFixture() {
        const [owner, otherAccount] = await hre.viem.getWalletClients();
        const token = await hre.viem.deployContract("MyToken", [
            "Degen",
            "DEGEN",
        ]);
        const publicClient = await hre.viem.getPublicClient();
        const walletClient = await hre.viem.getWalletClient(
            owner.account.address
        );
        return {
            owner,
            otherAccount,
            token,
            publicClient,
            walletClient,
        };
    }

    describe("Initialization", function () {
        it("Should correctly set up name, symbol, and decimals", async () => {
            const { token } = await loadFixture(deployTokenFixture);
            expect(await token.read.name()).to.equal("Degen");
            expect(await token.read.symbol()).to.equal("DEGEN");
            expect(await token.read.decimals()).to.equal(18);
        });

        it("Should assign the initial supply to the owner", async function () {
            const { token, owner } = await loadFixture(deployTokenFixture);
            const ownerBalance = await token.read.balanceOf([
                owner.account.address,
            ]);
            expect(ownerBalance).to.equal(parseUnits("1000000", 18));
        });
    });

    describe("Minting", function () {
        it("Should allow the owner to mint tokens", async function () {
            const { token, otherAccount } =
                await loadFixture(deployTokenFixture);
            const mintAmount = parseUnits("500", 18);
            await expect(
                token.write.mint([otherAccount.account.address, mintAmount])
            ).to.be.fulfilled;
            const otherAccountBalance = await token.read.balanceOf([
                otherAccount.account.address,
            ]);
            expect(otherAccountBalance).to.equal(mintAmount);
        });

        it("Should revert if a non-owner tries to mint tokens", async function () {
            const { token, otherAccount } =
                await loadFixture(deployTokenFixture);
            const mintAmount = parseUnits("500", 18);
            const tokenAsOther = await hre.viem.getContractAt(
                "MyToken",
                token.address,
                {
                    client: { wallet: otherAccount },
                }
            );

            await expect(
                tokenAsOther.write.mint([
                    otherAccount.account.address,
                    mintAmount,
                ])
            ).to.be.rejectedWith("Only owner can call this function");
        });
    });

    describe("Permit", function () {
        it("Should execute a permit correctly", async function () {
            // Загружаем контракт и создаем фикстуру (initial setup)
            const { token, owner, otherAccount, publicClient, walletClient } =
                await loadFixture(deployTokenFixture);

            // Определяем количество токенов, которое будет разрешено для использования
            const amount = parseUnits("500", 18);

            // Читаем текущее значение nonce для владельца токенов (используется для предотвращения повторного использования подписей)
            const nonce = await token.read.nonces([owner.account.address]);

            // Устанавливаем срок действия подписи на 1 час вперед от текущего времени
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

            // Определяем домен EIP-712 для генерации подписи (содержит информацию о контексте)
            const domain = {
                name: "Degen", // Имя токена
                version: "1", // Версия контракта
                chainId: publicClient.chain.id, // ID сети (чтобы подпись была уникальной для каждой сети)
                verifyingContract: token.address, // Адрес контракта, который проверяет подпись
            };

            // Определяем типы данных для подписи EIP-712 (структура данных)
            const types = {
                Permit: [
                    { name: "owner", type: "address" }, // Адрес владельца токенов
                    { name: "spender", type: "address" }, // Адрес того, кто получит разрешение
                    { name: "value", type: "uint256" }, // Количество токенов для разрешения
                    { name: "nonce", type: "uint256" }, // Nonce, чтобы предотвратить повторное использование подписей
                    { name: "deadline", type: "uint256" }, // Срок действия подписи
                ],
            };

            // Сообщение, которое будет подписано владельцем
            const message = {
                owner: owner.account.address,
                spender: otherAccount.account.address,
                value: amount,
                nonce: nonce,
                deadline: deadline,
            };

            // Генерируем подпись через walletClient, используя EIP-712 (метод signTypedData)
            const signature = await walletClient.signTypedData({
                account: owner.account.address, // Адрес подписывающего
                domain, // Домен EIP-712
                types, // Типы данных
                primaryType: "Permit", // Основной тип для подписи
                message, // Данные, которые будут подписаны
            });

            // Конвертируем подпись из строки в байты и извлекаем r, s и v (части подписи)
            const r = signature.slice(0, 66); // r - первые 32 байта (64 символа в hex)
            const s = `0x${signature.slice(66, 130)}`; // s - следующие 32 байта
            const v = parseInt(signature.slice(130, 132), 16); // v - последний байт, преобразуем его в число

            // Вызываем функцию permit с полученными значениями (v, r, s)
            // Это позволяет otherAccount управлять amount токенов от лица owner
            await expect(
                token.write.permit([
                    owner.account.address,
                    otherAccount.account.address,
                    amount,
                    deadline,
                    v,
                    r as `0x${string}`,
                    s as `0x${string}`,
                ])
            ).to.be.fulfilled; // Проверяем, что вызов прошел успешно

            // Проверяем, что allowance (разрешение на использование токенов) был установлен корректно
            const allowance = await token.read.allowance([
                owner.account.address,
                otherAccount.account.address,
            ]);
            expect(allowance).to.equal(amount); // Проверяем, что allowance совпадает с запрашиваемым значением
        });

        it("Should revert with an invalid signature", async function () {
            const { token, owner, otherAccount } =
                await loadFixture(deployTokenFixture);
            const amount = parseUnits("500", 18);
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

            // Используем значения, которые соответствуют длине байт 32
            const invalidSignature = {
                v: 27, // Значение v
                r: "0x" + "0".repeat(64), // r длиной 32 байта (64 символа)
                s: "0x" + "0".repeat(64), // s длиной 32 байта (64 символа)
            };

            await expect(
                token.write.permit([
                    owner.account.address,
                    otherAccount.account.address,
                    amount,
                    deadline,
                    invalidSignature.v,
                    invalidSignature.r as `0x${string}`,
                    invalidSignature.s as `0x${string}`,
                ])
            ).to.be.rejectedWith("ECDSAInvalidSignature()");
        });
        it("Should revert if permit has expired", async function () {
            // Загружаем фикстуру, которая деплоит контракт и подготавливает тестовое окружение.
            const { token, owner, otherAccount, publicClient, walletClient } =
                await loadFixture(deployTokenFixture);

            // Задаем количество токенов для разрешения (permit).
            const amount = parseUnits("500", 18);

            // Получаем текущий nonce для владельца (owner) токенов.
            const nonce = await token.read.nonces([owner.account.address]);

            // Устанавливаем срок действия permit в прошлом, чтобы вызвать ошибку.
            // Это означает, что подпись будет считаться просроченной.
            const expiredDeadline = BigInt(Math.floor(Date.now() / 1000) - 60);

            // Определяем домен для EIP-712 подписи.
            // Это включает информацию о контракте и сети, на которой он работает.
            const domain = {
                name: "Degen", // Название токена.
                version: "1", // Версия токена.
                chainId: publicClient.chain.id, // Идентификатор сети (например, Ethereum).
                verifyingContract: token.address, // Адрес контракта, который проверяет подпись.
            };

            // Определяем структуру данных для подписи в формате EIP-712.
            const types = {
                Permit: [
                    { name: "owner", type: "address" },
                    { name: "spender", type: "address" },
                    { name: "value", type: "uint256" },
                    { name: "nonce", type: "uint256" },
                    { name: "deadline", type: "uint256" },
                ],
            };

            // Создаем сообщение для подписи, содержащее информацию о разрешении.
            const message = {
                owner: owner.account.address,
                spender: otherAccount.account.address,
                value: amount,
                nonce: nonce,
                deadline: expiredDeadline, // Срок действия, установленный в прошлом.
            };

            // Используем walletClient для генерации подписи типа EIP-712.
            const signature = await walletClient.signTypedData({
                account: owner.account.address,
                domain,
                types,
                primaryType: "Permit",
                message,
            });

            // Извлекаем r, s и v из подписи, которые необходимы для вызова метода permit.
            const r = signature.slice(0, 66); // Первые 32 байта (64 символа) — это r.
            const s = `0x${signature.slice(66, 130)}`; // Следующие 32 байта — это s.
            const v = parseInt(signature.slice(130, 132), 16); // Последний байт — это v.

            // Вызываем метод permit на контракте, ожидая, что вызов будет отклонен из-за просроченной подписи.
            await expect(
                token.write.permit([
                    owner.account.address,
                    otherAccount.account.address,
                    amount,
                    expiredDeadline,
                    v,
                    r as `0x${string}`,
                    s as `0x${string}`,
                ])
            ).to.be.rejectedWith("ERC2612ExpiredSignature"); // Ожидаем ошибку с сообщением о просроченном сроке действия.
        });
    });
});
