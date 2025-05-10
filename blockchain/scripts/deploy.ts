import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// Testnet:
// npx hardhat run scripts/deploy.ts --network base-sepolia
// npx hardhat verify --network base-sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

// Mainnet:
// npx hardhat run scripts/deploy.ts --network base
// npx hardhat verify --network base <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

// Access hre (hardhat runtime environment)
declare const hre: HardhatRuntimeEnvironment;

async function main() {
  console.log(`Deploying OnlyPens contracts to ${network.name}...`);

  // Track total gas used
  let totalGasUsed = 0n;
  const gasUsageByContract: Record<string, bigint> = {};

  // Network-specific configuration
  const networkConfig = getNetworkConfig(network.name);
  console.log(`Using USDC address: ${networkConfig.usdcAddress}`);

  // First deploy the OnlyPensHelpers library
  console.log("Deploying OnlyPensHelpers library...");
  const OnlyPensHelpers = await ethers.getContractFactory("OnlyPensHelpers");
  const onlyPensHelpers = await OnlyPensHelpers.deploy();
  const helpersTx = await onlyPensHelpers.deploymentTransaction();
  const helpersReceipt = await helpersTx!.wait();
  const helpersGasUsed = helpersReceipt!.gasUsed;
  totalGasUsed += helpersGasUsed;
  gasUsageByContract["OnlyPensHelpers"] = helpersGasUsed;

  const helpersAddress = await onlyPensHelpers.getAddress();
  console.log(`OnlyPensHelpers deployed to: ${helpersAddress}`);
  console.log(`Gas used: ${helpersGasUsed.toString()}`);

  // Deploy OnlyPens implementation with library linking
  console.log("Deploying OnlyPens implementation...");
  const OnlyPens = await ethers.getContractFactory("OnlyPens", {
    libraries: {
      OnlyPensHelpers: helpersAddress,
    },
  });

  const onlyPensImpl = await OnlyPens.deploy();
  const implTx = await onlyPensImpl.deploymentTransaction();
  const implReceipt = await implTx!.wait();
  const implGasUsed = implReceipt!.gasUsed;
  totalGasUsed += implGasUsed;
  gasUsageByContract["OnlyPensImplementation"] = implGasUsed;

  const implAddress = await onlyPensImpl.getAddress();
  console.log(`OnlyPens implementation deployed to: ${implAddress}`);
  console.log(`Gas used: ${implGasUsed.toString()}`);

  // Deploy proxy admin
  console.log("Deploying CustomProxyAdmin...");
  const ProxyAdmin = await ethers.getContractFactory("CustomProxyAdmin");
  const proxyAdmin = await ProxyAdmin.deploy();
  const adminTx = await proxyAdmin.deploymentTransaction();
  const adminReceipt = await adminTx!.wait();
  const adminGasUsed = adminReceipt!.gasUsed;
  totalGasUsed += adminGasUsed;
  gasUsageByContract["CustomProxyAdmin"] = adminGasUsed;

  const adminAddress = await proxyAdmin.getAddress();
  console.log(`CustomProxyAdmin deployed to: ${adminAddress}`);
  console.log(`Gas used: ${adminGasUsed.toString()}`);

  // Initialize data for the proxy
  const initializeData = OnlyPens.interface.encodeFunctionData("initialize", [
    networkConfig.usdcAddress,
  ]);

  // Deploy the TransparentUpgradeableProxy
  console.log("Deploying CustomTransparentUpgradeableProxy...");
  const TransparentUpgradeableProxy = await ethers.getContractFactory(
    "CustomTransparentUpgradeableProxy"
  );
  const proxy = await TransparentUpgradeableProxy.deploy(
    implAddress,
    adminAddress,
    initializeData
  );
  const proxyTx = await proxy.deploymentTransaction();
  const proxyReceipt = await proxyTx!.wait();
  const proxyGasUsed = proxyReceipt!.gasUsed;
  totalGasUsed += proxyGasUsed;
  gasUsageByContract["CustomTransparentUpgradeableProxy"] = proxyGasUsed;

  const proxyAddress = await proxy.getAddress();
  console.log(`Proxy deployed to: ${proxyAddress}`);
  console.log(`Gas used: ${proxyGasUsed.toString()}`);

  // Create a contract instance at the proxy address
  const onlyPens = OnlyPens.attach(proxyAddress);
  console.log("OnlyPens deployed successfully!");

  // Log total gas used
  console.log("\n--- Gas Usage Summary ---");
  for (const [contract, gas] of Object.entries(gasUsageByContract)) {
    console.log(`${contract}: ${gas.toString()} gas`);
  }
  console.log(`Total gas used: ${totalGasUsed.toString()} gas`);

  // Get current gas price
  const gasPrice = await ethers.provider.getFeeData();
  if (gasPrice.gasPrice) {
    const gasCostWei = totalGasUsed * gasPrice.gasPrice;
    const gasCostEth = ethers.formatEther(gasCostWei);
    console.log(
      `Estimated cost: ${gasCostEth} ETH at gas price of ${ethers.formatUnits(
        gasPrice.gasPrice,
        "gwei"
      )} gwei`
    );
  }
  console.log("------------------------\n");

  // Verify contracts on Etherscan if API key is available
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations before verification...");
    // Wait for 5 blocks for transaction confirmations
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Simple delay of 1 minute

    console.log("Verifying contracts on Etherscan...");
    try {
      await verifyContract(helpersAddress, []);
      await verifyContract(implAddress, [], {
        OnlyPensHelpers: helpersAddress,
      });
      await verifyContract(adminAddress, []);
      await verifyContract(proxyAddress, [
        implAddress,
        adminAddress,
        initializeData,
      ]);
    } catch (error) {
      console.log("Error during verification:", error);
    }
  }

  // Save deployment info to a file
  saveDeploymentInfo(network.name, {
    network: network.name,
    onlyPensHelpers: helpersAddress,
    onlyPensImpl: implAddress,
    proxyAdmin: adminAddress,
    proxy: proxyAddress,
    usdcAddress: networkConfig.usdcAddress,
    gasUsage: {
      byContract: Object.fromEntries(
        Object.entries(gasUsageByContract).map(([k, v]) => [k, v.toString()])
      ),
      total: totalGasUsed.toString(),
    },
    timestamp: new Date().toISOString(),
  });

  console.log("Deployment complete!");
}

// Helper function for contract verification
async function verifyContract(
  address: string,
  constructorArguments: any[],
  libraries: Record<string, string> = {}
) {
  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments,
      libraries,
    });
    console.log(`Contract at ${address} verified successfully`);
  } catch (error: any) {
    if (error.message.includes("already verified")) {
      console.log(`Contract at ${address} already verified`);
    } else {
      console.error(`Verification error for ${address}:`, error);
    }
  }
}

// Get network-specific configuration
function getNetworkConfig(networkName: string) {
  // USDC contract addresses for different networks
  const configs: Record<string, { usdcAddress: string; isTestnet: boolean }> = {
    // Base Sepolia testnet
    "base-sepolia": {
      usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC address on Base Sepolia
      isTestnet: true,
    },
    // Base Mainnet
    base: {
      usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC address on Base Mainnet
      isTestnet: false,
    },
    // Hardhat local network - using a zero address as placeholder
    hardhat: {
      usdcAddress: "0x0000000000000000000000000000000000000000",
      isTestnet: true,
    },
    // Localhost network (for testing)
    localhost: {
      usdcAddress: "0x0000000000000000000000000000000000000000",
      isTestnet: true,
    },
  };

  // Default to hardhat if network not found
  return configs[networkName] || configs["hardhat"];
}

// Save deployment information to a JSON file
function saveDeploymentInfo(networkName: string, deploymentInfo: any) {
  const deploymentsDir = path.join(__dirname, "../deployments");

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filePath = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to ${filePath}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
