import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";

import "hardhat-contract-sizer";
import "hardhat-deploy";
import "hardhat-deploy-ethers";

import { HardhatUserConfig } from "hardhat/types";
import "./tasks/global";

require("dotenv").config();

const hhconfig: HardhatUserConfig = {
  solidity: {
    version: "0.7.5",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      mining: {
        auto: true,
        interval: 12000,
      },
      forking: {
        url: process.env.MAINNET_RPC,
      },
    },
    mainnet: {
      url: process.env.MAINNET_RPC,
      accounts: [process.env.DEPLOYER_PKEY],
    },
  },
  namedAccounts: {
    deployer: 0,
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: false,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
  },
};
export default hhconfig;
