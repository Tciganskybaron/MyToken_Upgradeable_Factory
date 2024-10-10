import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@openzeppelin/hardhat-upgrades";
import { config as loadEnv } from "dotenv";
loadEnv();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_ID = process.env.INFURA_ID;
const INFURA_MAINNET_URL = process.env.INFURA_MAINNET_URL;
const INFURA_SEPOLIA_URL = process.env.INFURA_SEPOLIA_URL;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

const config: HardhatUserConfig = {
    networks: {
        local: {
            url: "http://localhost:8545",
        },
        hardhat: {
            allowUnlimitedContractSize: true,
        },
        mainnet: {
            url: `${INFURA_MAINNET_URL}${INFURA_ID}`,
            accounts: [PRIVATE_KEY as string],
            chainId: 1,
        },
        sepolia: {
            url: `${INFURA_SEPOLIA_URL}${INFURA_ID}`,
            accounts: [PRIVATE_KEY as string],
            chainId: 11155111,
        },
    },
    etherscan: {
        apiKey: {
            mainnet: ETHERSCAN_API_KEY || "",
            sepolia: ETHERSCAN_API_KEY || "",
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.27",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000000,
                    },
                    evmVersion: "cancun",
                },
            },
        ],
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        gasPrice: 21,
        coinmarketcap: COINMARKETCAP_API_KEY,
    },
};

export default config;
