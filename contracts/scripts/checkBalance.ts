import { ethers } from "hardhat";
import { StratToken } from "../typechain-types";

async function main() {
  // Contract address from the deployment
  const tokenAddress = "0x643B4995e6D0F1C5e31a062838777CC2ab670185";
  const treasuryAddress = "0x6D9053221D9438E792C7Ef91040f02eD131e5Ec0";

  // Get the contract instance
  const Token = await ethers.getContractFactory("StratToken");
  const token = (await Token.attach(tokenAddress)) as StratToken;

  // Get token info
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  const treasuryBalance = await token.balanceOf(treasuryAddress);

  console.log("Token Info:");
  console.log("  Name:", name);
  console.log("  Symbol:", symbol);
  console.log("  Decimals:", decimals);
  console.log("  Treasury Balance:", ethers.formatEther(treasuryBalance), "STRAT");
  
  // Get contract status
  const status = await token.status();
  const isFundraisingActive = await token.isFundraisingActive();
  
  const statusNames = ["Pending", "Fundraising", "Completed", "Trading", "Failed"];
  console.log("\nContract Status:");
  console.log("  Status:", statusNames[Number(status)]);
  console.log("  Fundraising Active:", isFundraisingActive);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 