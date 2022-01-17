import { task } from "hardhat/config";
import { BigNumber } from "@ethersproject/bignumber";

const SLP = "0x2734f4a846d1127f4b5d3bab261facfe51df1d9a";
const ROUTER = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
const LOBI = "0xDEc41Db0c33F3F6f3cb615449C311ba22D418A8d";

task("migrate", "migrate ohm v1 to v2").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const { execute } = deployments;

    const pair = SLP;
    const routerFrom = ROUTER;
    const routerTo = ROUTER;
    const token = LOBI;
    const minA = 0;
    const minB = 0;
    const deadline = Math.round(Date.now() / 1000) + 1800;

    await execute(
      "LiquidityMigrator",
      { from: deployer },
      "migrateLP",
      pair,
      routerFrom,
      routerTo,
      token,
      minA,
      minB,
      deadline
    );
  }
);
