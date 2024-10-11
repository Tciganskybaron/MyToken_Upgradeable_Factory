// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MyFactoryTokenModule = buildModule("MyFactoryTokenModule", (m) => {
    const factory = m.contract("Factory");

    return { factory };
});

export default MyFactoryTokenModule;
