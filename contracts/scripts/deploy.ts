import { ethers, run } from "hardhat";

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

  // Wait for 5 block confirmations and add a delay
  console.log("\nWaiting for block confirmations...");
  const deploymentReceipt = await token.deploymentTransaction()?.wait(5);
  
  // Add a 30-second delay to ensure Etherscan has indexed the contract
  console.log("Waiting 30 seconds before verification...");
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Verify the contract
  console.log("\nVerifying contract...");
  try {
    await run("verify:verify", {
      address: tokenAddress,
      constructorArguments: [
        name,
        symbol,
        targetRaise,
        pricePerToken,
        deployer.address,
        deployer.address,
      ],
    });
    console.log("Contract verified successfully");
  } catch (error: any) {
    if (error?.message?.includes("Already Verified")) {
      console.log("Contract was already verified");
    } else {
      console.error("Error verifying contract:", error);
      
      // If first attempt fails, wait longer and try again
      console.log("\nRetrying verification in 60 seconds...");
      await new Promise(resolve => setTimeout(resolve, 60000));
      
      try {
        await run("verify:verify", {
          address: tokenAddress,
          constructorArguments: [
            name,
            symbol,
            targetRaise,
            pricePerToken,
            deployer.address,
            deployer.address,
          ],
        });
        console.log("Contract verified successfully on second attempt");
      } catch (retryError) {
        console.error("Error verifying contract on second attempt:", retryError);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 