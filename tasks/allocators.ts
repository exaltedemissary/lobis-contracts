import { task } from "hardhat/config";
import { BigNumber } from "@ethersproject/bignumber";

task("configure-onsen", "Configure onsen staking").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const { execute } = deployments;

    const SLP = "0x2734F4A846D1127f4B5D3BAb261FaCfe51dF1D9a";
    const PID = 340;

    await execute("OnsenAllocator", { from: deployer }, "addPool", SLP, PID);

    // set allocator as liquidity depositor
  }
);
