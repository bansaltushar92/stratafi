import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the contract
  const StratToken = await ethers.getContractFactory("StratToken");
  const token = await StratToken.deploy(
    "Stratafi Token",                    // name
    "STRAT",                            // symbol
    ethers.parseEther("100"),           // targetRaise (100 ETH)
    ethers.parseEther("0.01"),          // pricePerToken (0.01 ETH)
    deployer.address,                    // treasury
    deployer.address,                    // initialOwner
    { gasLimit: ethers.getBigInt(5000000) }  // Explicit gas limit for Base
  );

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log("Token deployed to:", tokenAddress);
  console.log("Token details:");
  console.log("  Name:", await token.name());
  console.log("  Symbol:", await token.symbol());
  console.log("  Target Raise:", ethers.formatEther(await token.targetRaise()), "ETH");
  console.log("  Price per Token:", ethers.formatEther(await token.pricePerToken()), "ETH");
  console.log("  Treasury:", await token.treasury());
  console.log("  Owner:", await token.owner());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 