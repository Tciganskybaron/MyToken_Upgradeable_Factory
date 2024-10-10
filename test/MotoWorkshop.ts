import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("MotoWorkshop", function () {
    // Фикстура для развертывания контракта и подготовки аккаунтов
    async function deployWorkshopFixture() {
        const [owner, otherAccount, thirdAccount] =
            await hre.viem.getWalletClients();
        const workshop = await hre.viem.deployContract("MotoWorkshop", [
            "MotoHub",
        ]);
        const publicClient = await hre.viem.getPublicClient();
        return {
            owner,
            otherAccount,
            thirdAccount,
            workshop,
            publicClient,
        };
    }

    describe("Initialization", function () {
        it("Should correctly set the MotoWorkshop name", async () => {
            const { workshop } = await loadFixture(deployWorkshopFixture);
            expect(await workshop.read.name()).to.equal("MotoHub");
        });
    });

    describe("addMotorcycle", function () {
        it("Should fail to add a motorcycle with zero mileage", async () => {
            const { workshop } = await loadFixture(deployWorkshopFixture);
            const mileage = BigInt(0);

            // Проверяем, что добавление мотоцикла с пробегом 0 вызывает ошибку
            await expect(
                workshop.write.addMotorcycle(["ducati", mileage])
            ).to.be.rejectedWith("Mileage must be greater than 0");
        });

        it("Should fail to add a motorcycle with an empty model", async () => {
            const { workshop } = await loadFixture(deployWorkshopFixture);
            const mileage = BigInt(10);

            // Проверяем, что добавление мотоцикла с пустой моделью вызывает ошибку
            await expect(
                workshop.write.addMotorcycle(["", mileage])
            ).to.be.rejectedWith("Model cannot be empty");
        });

        it("Should successfully add a motorcycle", async () => {
            const { workshop } = await loadFixture(deployWorkshopFixture);
            const mileage = BigInt(1000);

            // Проверяем успешное добавление мотоцикла
            await expect(workshop.write.addMotorcycle(["ducati", mileage])).to
                .be.fulfilled;
        });
    });

    describe("updateMileage", function () {
        it("Should fail to update mileage with an invalid index", async () => {
            const { workshop } = await loadFixture(deployWorkshopFixture);
            const index = BigInt(10);
            const mileage = BigInt(1000);

            // Добавляем мотоцикл и проверяем, что обновление пробега с несуществующим индексом вызывает ошибку
            await workshop.write.addMotorcycle(["ducati", mileage]);
            await expect(
                workshop.write.updateMileage([index, mileage])
            ).to.be.rejectedWith("Invalid index");
        });

        it("Should fail to update mileage to zero", async () => {
            const { workshop } = await loadFixture(deployWorkshopFixture);
            const index = BigInt(0);
            const initialMileage = BigInt(100);
            const newMileage = BigInt(0);

            // Добавляем мотоцикл с пробегом, затем пытаемся обновить пробег до 0
            await workshop.write.addMotorcycle(["ducati", initialMileage]);
            await expect(
                workshop.write.updateMileage([index, newMileage])
            ).to.be.rejectedWith("Mileage zero");
        });

        it("Should successfully update mileage", async () => {
            const { workshop } = await loadFixture(deployWorkshopFixture);
            const index = BigInt(0);
            const mileage = BigInt(1000);

            // Добавляем мотоцикл и обновляем его пробег
            await workshop.write.addMotorcycle(["ducati", mileage]);
            await expect(workshop.write.updateMileage([index, mileage])).to.be
                .fulfilled;
        });
    });

    describe("calculateRepairCost", function () {
        it("Should fail to calculate repair cost with empty parts costs", async () => {
            const { workshop } = await loadFixture(deployWorkshopFixture);
            const partsCosts: bigint[] = [];

            // Проверяем, что расчет стоимости ремонта с пустым массивом вызывает ошибку
            await expect(
                workshop.read.calculateRepairCost([partsCosts])
            ).to.be.rejectedWith("partsCosts cannot be empty");
        });

        it("Should correctly calculate the total repair cost", async () => {
            const { workshop } = await loadFixture(deployWorkshopFixture);
            const partsCosts: bigint[] = [BigInt(100), BigInt(250)];

            // Проверяем правильность вычисления общей стоимости ремонта
            const result = await workshop.read.calculateRepairCost([
                partsCosts,
            ]);
            expect(result).to.equal(BigInt(350));
        });
    });

    describe("getMotorcycle", function () {
        it("Should fail to get motorcycle with an invalid index", async () => {
            const { workshop } = await loadFixture(deployWorkshopFixture);
            const mileage = BigInt(1000);
            const index = BigInt(10);

            // Добавляем мотоцикл и проверяем, что получение данных с несуществующим индексом вызывает ошибку
            await workshop.write.addMotorcycle(["ducati", mileage]);
            await expect(
                workshop.read.getMotorcycle([index])
            ).to.be.rejectedWith("Invalid index");
        });

        // it("Should retrieve the correct motorcycle data", async () => {
        //     const { workshop } = await loadFixture(deployWorkshopFixture);
        //     const mileage = BigInt(1000);
        //     const index = BigInt(0);

        //     // Добавляем мотоцикл и проверяем корректность данных, полученных по индексу
        //     await workshop.write.addMotorcycle(["ducati", mileage]);
        //     const moto = await workshop.read.getMotorcycle([index]);

        //     expect(moto.model).to.equal("ducati");
        //     expect(moto.mileage).to.equal(mileage);
        // });
    });
});
