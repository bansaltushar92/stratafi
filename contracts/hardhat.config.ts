import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

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
      },
      base_goerli: {
        url: process.env.BASE_GOERLI_RPC || "https://goerli.base.org",
        accounts: [process.env.PRIVATE_KEY],
        gasPrice: "auto"
      },
      base: {
        url: process.env.BASE_MAINNET_RPC || "https://mainnet.base.org",
        accounts: [process.env.PRIVATE_KEY],
        gasPrice: "auto"
      }
    } : {}),
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      base: process.env.BASESCAN_API_KEY || "",
      "base-goerli": process.env.BASESCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "base-goerli",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org"
        }
      }
    ]
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config; 