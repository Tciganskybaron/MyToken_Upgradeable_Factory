// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MyTokenModule = buildModule("MyTokenModule", (m) => {
    const name = "Degen";
    const symbol = "DEGEN";
    const token = m.contract("MyToken", [name, symbol]);

    return { token };
});

export default MyTokenModule;
