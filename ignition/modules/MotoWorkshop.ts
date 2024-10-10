// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MotoWorkshopModule = buildModule("MotoWorkshop", (m) => {
    const nameWorkshop = "MotoHub";
    const workshop = m.contract("MotoWorkshop", [nameWorkshop]);

    return { workshop };
});

export default MotoWorkshopModule;
