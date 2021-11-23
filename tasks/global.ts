import { task } from "hardhat/config";
import { BigNumber } from "@ethersproject/bignumber";

const ROUTER_ABI = require("../scripts/abis/Router.json");
const SUSHIFACTORY_ABI = require("../scripts/abis/SushiFactory.json");

task("configure-staking", "Configure staking part of Lobis").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const stakingWarmup = await deployments.get("StakingWarmup");
    const distributor = await deployments.get("Distributor");

    // set distributor contracts
    await deployments.execute(
      "LobisStaking",
      { from: deployer },
      "setContract",
      "0",
      distributor.address
    );

    // set warmup contracts
    await deployments.execute(
      "LobisStaking",
      { from: deployer },
      "setContract",
      "1",
      stakingWarmup.address
    );

    console.log("staking configured");
  }
);

task("configure-staked-lobi", "Configure staked LOBI").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const staking = await deployments.get("LobisStaking");
    const initialIndex = BigNumber.from(1).mul(BigNumber.from(10).pow(9));

    // initialize sLOBI
    await deployments.execute(
      "StakedLobiERC20",
      { from: deployer },
      "initialize",
      staking.address
    );

    // set initial index on sLOBI
    await deployments.execute(
      "StakedLobiERC20",
      { from: deployer },
      "setIndex",
      initialIndex
    );

    console.log("staked lobi configured");
  }
);

task("mint-lobi", "Mint initial LOBI supply").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const mintAmount = BigNumber.from(15000).mul(BigNumber.from(10).pow(9)); // TODO maybe change ?

    const treasury = await deployments.get("LobisTreasury");

    await deployments.execute(
      "LobiERC20",
      { from: deployer },
      "setVault",
      deployer
    );

    await deployments.execute(
      "LobiERC20",
      { from: deployer },
      "mint",
      deployer,
      mintAmount
    );

    await deployments.execute(
      "LobiERC20",
      { from: deployer },
      "setVault",
      treasury.address
    );

    console.log("LOBI minted");
  }
);

task("configure-distributor", "Configure distributor").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const initialRewardRate = "1000"; // 0.1%
    const staking = await deployments.get("LobisStaking");

    await deployments.execute(
      "Distributor",
      { from: deployer },
      "addRecipient",
      staking.address,
      initialRewardRate
    );

    console.log("distributor configured");
  }
);

task("configure-treasury", "Configure treasury").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const distributor = await deployments.get("Distributor");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "8",
      distributor.address
    );

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "8",
      distributor.address
    );

    console.log("treasury configured");
  }
);

task("configure-crv-bond", "Configure CRV bond").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const linkBondBCV = "700";
    const bondVestingLength = "33230";
    const minBondPrice = "576131";
    const maxBondPayout = "500"; // 0.5% of totalSupply
    const bondFee = "50";
    const bondFeePartner = "110";
    const maxBondDebt = "1000000000000000";
    const intialBondDebt = "0";

    const stakingHelper = await deployments.get("StakingHelper");
    const bond = await deployments.get("TokenBondDepositoryCRV");

    const CRV = "0xD533a949740bb3306d119CC777fa900bA034cd52";
    const FACTOR = 10000;

    await deployments.execute(
      "TokenBondDepositoryCRV",
      { from: deployer },
      "initializeBondTerms",
      linkBondBCV,
      bondVestingLength,
      minBondPrice,
      maxBondPayout,
      maxBondDebt,
      intialBondDebt,
      bondFee,
      bondFeePartner
    );

    await deployments.execute(
      "TokenBondDepositoryCRV",
      { from: deployer },
      "setStaking",
      stakingHelper.address,
      true
    );

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "8",
      bond.address
    );

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "8",
      bond.address
    );

    // set bond as reserve depositor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "0",
      bond.address
    );

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "0",
      bond.address
    );

    // set CRV as reserve asset
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "2",
      CRV
    );

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "2",
      CRV
    );

    // set token factor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "setTokenFactor",
      CRV,
      FACTOR
    );

    console.log("crv bond configured");
  }
);

task("configure-fxs-bond", "Configure FXS bond").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const linkBondBCV = "400";
    const bondVestingLength = "33230";
    const minBondPrice = "155469";
    const maxBondPayout = "500"; // 0.5% of totalSupply
    const bondFee = "50";
    const bondFeePartner = "110";
    const maxBondDebt = "1000000000000000";
    const intialBondDebt = "0";

    const stakingHelper = await deployments.get("StakingHelper");
    const bond = await deployments.get("TokenBondDepositoryFXS");

    const FXS = "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0";
    const FACTOR = 50000;

    await deployments.execute(
      "TokenBondDepositoryFXS",
      { from: deployer },
      "initializeBondTerms",
      linkBondBCV,
      bondVestingLength,
      minBondPrice,
      maxBondPayout,
      maxBondDebt,
      intialBondDebt,
      bondFee,
      bondFeePartner
    );

    await deployments.execute(
      "TokenBondDepositoryFXS",
      { from: deployer },
      "setStaking",
      stakingHelper.address,
      true
    );

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "8",
      bond.address
    );

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "8",
      bond.address
    );

    // set bond as reserve depositor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "0",
      bond.address
    );

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "0",
      bond.address
    );

    // set FXS as reserve asset
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "2",
      FXS
    );

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "2",
      FXS
    );

    // set token factor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "setTokenFactor",
      FXS,
      FACTOR
    );
    console.log("fxs bond configured");
  }
);

task("configure-ohm-lobi-bond", "Configure OHM/LOBI bond").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const linkBondBCV = "50";
    const bondVestingLength = "33230";
    const minBondPrice = "1661";
    const maxBondPayout = "500"; // 0.5% of totalSupply
    const bondFee = "50";
    const bondFeePartner = "110";
    const maxBondDebt = "1000000000000000";
    const intialBondDebt = "0";

    const stakingHelper = await deployments.get("StakingHelper");
    const bond = await deployments.get("TokenBondDepositoryOHMLOBI");

    const SLP = "0x9e65abe26F72c7ccdf55E40fDCC947Cbc4f4e61e";
    const FACTOR = 200000;

    await deployments.execute(
      "TokenBondDepositoryOHMLOBI",
      { from: deployer },
      "initializeBondTerms",
      linkBondBCV,
      bondVestingLength,
      minBondPrice,
      maxBondPayout,
      maxBondDebt,
      intialBondDebt,
      bondFee,
      bondFeePartner
    );

    await deployments.execute(
      "TokenBondDepositoryOHMLOBI",
      { from: deployer },
      "setStaking",
      stakingHelper.address,
      true
    );

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "8",
      bond.address
    );

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "8",
      bond.address
    );

    // set bond as liquidity depositor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "4",
      bond.address
    );

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "4",
      bond.address
    );

    // set SLP as liquidity asset
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "5",
      SLP
    );

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "5",
      SLP
    );

    // set token factor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "setTokenFactor",
      SLP,
      FACTOR
    );
    console.log("ohm/lobi bond configured");
  }
);

task("create-sushi-pair", "Configure staking part of Lobis").setAction(
  async (args, { ethers, deployments, getNamedAccounts, network }) => {
    const { deployer } = await getNamedAccounts();

    const lobi = await deployments.get("LobiERC20");
    const SUSHI_ROUTER = "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f";
    const SUSHI_FACTORY = "0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac";
    const OHM = "0x383518188c0c6d7730d91b2c03a03c837814a899";
    const MAX_ALLOWANCE = BigNumber.from(2).pow(256).sub(1);

    const router = await ethers.getContractAt(ROUTER_ABI, SUSHI_ROUTER);
    const factory = await ethers.getContractAt(SUSHIFACTORY_ABI, SUSHI_FACTORY);
    const ohm = await ethers.getContractAt("LobiERC20", OHM);

    await deployments.execute(
      "LobiERC20",
      { from: deployer },
      "approve",
      SUSHI_ROUTER,
      MAX_ALLOWANCE
    );

    await (await ohm.approve(SUSHI_ROUTER, MAX_ALLOWANCE)).wait();

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x1a80bdc45371fd42ded979d15f224488cfc81b70"],
    });

    const ohmHolder = await ethers.provider.getSigner(
      "0x1a80bdc45371fd42ded979d15f224488cfc81b70"
    );

    await (
      await ohm.connect(ohmHolder).transfer(deployer, "55000000000")
    ).wait();

    const lobiAmount = BigNumber.from(116).mul(BigNumber.from(10).pow(9));
    const ohmAmount = BigNumber.from(55).mul(BigNumber.from(10).pow(9));

    const recipient = "0x719d08f7d8FAb3B0CA8aC45e18572402920f9875";

    const ETH_100 = BigNumber.from(10)
      .mul(BigNumber.from(10).pow(18))
      .toHexString();

    await network.provider.send("hardhat_setBalance", [recipient, ETH_100]);

    await (
      await router.addLiquidity(
        lobi.address,
        ohm.address,
        lobiAmount,
        ohmAmount,
        lobiAmount,
        ohmAmount,
        recipient,
        Math.round(Date.now() / 1000) + 1800
      )
    ).wait();

    const pair = await factory.getPair(lobi.address, ohm.address);
    console.log("pair", pair);
  }
);

task("feed-treasury", "Configure staking part of Lobis").setAction(
  async (args, { ethers, deployments, getNamedAccounts, network }) => {
    const { deployer } = await getNamedAccounts();

    const treasury = await deployments.get("LobisTreasury");
    const CRV_HOLDER = "0x0e33be39b13c576ff48e14392fbf96b02f40cd34";
    const FXS_HOLDER = "0x1e84614543Ab707089CebB022122503462AC51b3";

    const CRV = "0xD533a949740bb3306d119CC777fa900bA034cd52";
    const FXS = "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0";

    const crv = await ethers.getContractAt("DAI", CRV);
    const fxs = await ethers.getContractAt("DAI", FXS);
    const recipient = "0x719d08f7d8FAb3B0CA8aC45e18572402920f9875";

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [CRV_HOLDER],
    });

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [FXS_HOLDER],
    });

    const crvHolder = await ethers.provider.getSigner(CRV_HOLDER);
    const fxsHolder = await ethers.provider.getSigner(FXS_HOLDER);

    await (
      await crv
        .connect(crvHolder)
        .transfer(
          treasury.address,
          BigNumber.from(20000).mul(BigNumber.from(10).pow(18))
        )
    ).wait();

    await (
      await crv
        .connect(crvHolder)
        .transfer(
          recipient,
          BigNumber.from(200000).mul(BigNumber.from(10).pow(18))
        )
    ).wait();

    await (
      await fxs
        .connect(fxsHolder)
        .transfer(
          recipient,
          BigNumber.from(200000).mul(BigNumber.from(10).pow(18))
        )
    ).wait();

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "auditReserves"
    );

    const excess = await deployments.read("LobisTreasury", "excessReserves");

    console.log({
      excess: excess.toString(),
    });
  }
);

task("configure", "Configure all").setAction(async (args, { run }) => {
  await run("configure-staking");
  await run("configure-staked-lobi");
  await run("mint-lobi");
  await run("configure-distributor");
  await run("configure-treasury");

  await run("create-sushi-pair");

  await run("configure-crv-bond");
  await run("configure-fxs-bond");
  await run("configure-ohm-lobi-bond");

  await run("feed-treasury");
});

task("travel", "travel").setAction(async (args, { run, ethers }) => {
  const current = await ethers.provider.getBlockNumber();
  const last = current + 280;

  let curr = current;

  while (curr < last) {
    await ethers.provider.send("evm_mine", []);
    curr = curr + 1;
    console.log("remaining : ", last - curr);
  }
});
