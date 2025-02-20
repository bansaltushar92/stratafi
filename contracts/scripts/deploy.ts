import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get deployment parameters from environment variables
  const name = process.env.TOKEN_NAME || "Stratafi Token";
  const symbol = process.env.TOKEN_SYMBOL || "STRAT";
  const targetRaise = process.env.TARGET_RAISE ? 
    ethers.parseEther(process.env.TARGET_RAISE) : 
    ethers.parseEther("100");
  const pricePerToken = process.env.PRICE_PER_TOKEN ? 
    ethers.parseEther(process.env.PRICE_PER_TOKEN) : 
    ethers.parseEther("0.01");

  // Deploy the contract
  const StratToken = await ethers.getContractFactory("StratToken");
  const token = await StratToken.deploy(
    name,
    symbol,
    targetRaise,
    pricePerToken,
    deployer.address,
    deployer.address,
    { gasLimit: ethers.getBigInt(5000000) }
  );

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  // Output in consistent format for parsing
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