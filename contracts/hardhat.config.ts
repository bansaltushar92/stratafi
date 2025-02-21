import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: '../.env.local' });

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Only add network configs if private key is available
    ...(process.env.PRIVATE_KEY ? {
      sepolia: {
        url: process.env.SEPOLIA_RPC || "https://eth-sepolia.g.alchemy.com/v2/demo",
        accounts: [process.env.PRIVATE_KEY],
        gasPrice: "auto"
      }
    } : {}),
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || ""
    }
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config; 