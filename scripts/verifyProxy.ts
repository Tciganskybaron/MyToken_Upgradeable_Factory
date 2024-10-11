import { run } from "hardhat";

async function main() {
    // Адреса развернутых контрактов
    const myContractV1Address = "0xB4AB39cc01c5c0773497c126e56D10F749E04FF9"; // Замените на фактический адрес MyContractV1
    const myContractV2Address = "0x44E9612FAf2E1e30Bfa39578969D53a875c8A8Bd"; // Замените на фактический адрес MyContractV2

    console.log("Verifying MyContractV1...");
    await run("verify:verify", {
        address: myContractV1Address,
        constructorArguments: [], // Аргументы конструктора, если есть
    });

    console.log("Verifying MyContractV2...");
    await run("verify:verify", {
        address: myContractV2Address,
        constructorArguments: [], // Аргументы конструктора, если есть
    });

    console.log("Verification complete.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
