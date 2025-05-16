import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// Testnet:
// npx hardhat run scripts/deploy.ts --network base-sepolia
// npx hardhat verify --network base-sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

// Mainnet:
// npx hardhat run scripts/deploy.ts --network base
// npx hardhat verify --network base <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

// Access hardhat runtime environment
declare const hre: HardhatRuntimeEnvironment;

async function main() {
  const network = await ethers.provider.getNetwork();
  console.log(
    `Deploying to network: ${network.name} (chainId: ${network.chainId})`
  );

  // Constants
  const TREASURY_ADDRESS = "0xA996b471e6D161c776ac88b82cB55F3BC490a356";
  const USDC_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"; // Base Mainnet USDC
  // const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Testnet USDC

  const PLATFORM_FEE_BPS = process.env.PLATFORM_FEE_BPS || 1000; // 10%

  console.log("Deploying OnlyPensHelpers...");
  const OnlyPensHelpers = await ethers.getContractFactory("OnlyPensHelpers");
  const helpers = await OnlyPensHelpers.deploy();
  await helpers.waitForDeployment();
  const helpersAddress = await helpers.getAddress();
  console.log(`OnlyPensHelpers deployed to: ${helpersAddress}`);

  console.log("Deploying OnlyPens...");
  // Link the library
  const OnlyPens = await ethers.getContractFactory("OnlyPens", {
    libraries: {
      OnlyPensHelpers: helpersAddress,
    },
  });

  // Deploy without constructor args (the error is related to TypeScript typings, not the actual contract)
  // In production we'd fix the typing issue, but for now we'll use a workaround
  console.log(`USDC address: ${USDC_ADDRESS}`);
  console.log(`Treasury address: ${TREASURY_ADDRESS}`);
  console.log(
    `Platform fee: ${PLATFORM_FEE_BPS} (${Number(PLATFORM_FEE_BPS) / 100}%)`
  );

  // @ts-ignore - Ignore TypeScript errors for this line
  const onlyPens = await OnlyPens.deploy(
    USDC_ADDRESS,
    TREASURY_ADDRESS,
    PLATFORM_FEE_BPS
  );
  await onlyPens.waitForDeployment();
  const onlyPensAddress = await onlyPens.getAddress();
  console.log(`OnlyPens deployed to: ${onlyPensAddress}`);

  // Verify the values
  const usdc = await onlyPens.usdc();
  const treasury = await onlyPens.treasury();
  const fee = await onlyPens.platformFeeBps();

  console.log("\nVerification:");
  console.log(
    `USDC set correctly: ${usdc.toLowerCase() === USDC_ADDRESS.toLowerCase()}`
  );
  console.log(
    `Treasury set correctly: ${
      treasury.toLowerCase() === TREASURY_ADDRESS.toLowerCase()
    }`
  );
  console.log(
    `Platform fee set correctly: ${Number(fee) === PLATFORM_FEE_BPS}`
  );

  // Verify contracts on Etherscan
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\nWaiting for block confirmations before verification...");
    // Wait for 5 blocks for transaction confirmations
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Simple delay of 1 minute

    console.log("Verifying contracts on Etherscan...");

    // Store constructor args for verification
    const constructorArgs = [USDC_ADDRESS, TREASURY_ADDRESS, PLATFORM_FEE_BPS];

    try {
      // Verify OnlyPensHelpers library first
      console.log("Verifying OnlyPensHelpers...");
      await hre.run("verify:verify", {
        address: helpersAddress,
        constructorArguments: [],
      });
      console.log(`OnlyPensHelpers verified at ${helpersAddress}`);

      // Verify OnlyPens with constructor arguments and linked library
      console.log("Verifying OnlyPens...");
      await hre.run("verify:verify", {
        address: onlyPensAddress,
        constructorArguments: constructorArgs,
        libraries: {
          OnlyPensHelpers: helpersAddress,
        },
      });
      console.log(`OnlyPens verified at ${onlyPensAddress}`);
    } catch (error: any) {
      if (error.message.includes("already verified")) {
        console.log("Contract already verified!");
      } else {
        console.error("Error during verification:", error);
      }
    }
  } else {
    console.log("\nSkipping verification (ETHERSCAN_API_KEY not set)");
    console.log("To verify contracts manually, run:");
    console.log(
      `npx hardhat verify --network ${network.name} ${helpersAddress}`
    );
    console.log(
      `npx hardhat verify --network ${network.name} --libraries OnlyPensHelpers=${helpersAddress} ${onlyPensAddress} "${USDC_ADDRESS}" "${TREASURY_ADDRESS}" ${PLATFORM_FEE_BPS}`
    );
  }

  console.log("\nDeployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
