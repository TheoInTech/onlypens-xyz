import { ethers } from "hardhat";
import { ContractFactory } from "ethers";

// Helper function to simulate deployProxy from OpenZeppelin's hardhat-upgrades
export async function deployProxy(
  contractFactory: ContractFactory,
  args: any[] = []
) {
  // Deploy implementation contract
  const implementation = await contractFactory.deploy();
  await implementation.waitForDeployment();

  // Get the initialize function fragment
  const initializeFragment =
    contractFactory.interface.getFunction("initialize");

  // Make sure initialize function exists
  if (!initializeFragment) {
    throw new Error("Contract doesn't have an initialize function");
  }

  const initData = contractFactory.interface.encodeFunctionData(
    initializeFragment,
    args
  );

  // Deploy proxy admin
  const ProxyAdmin = await ethers.getContractFactory("CustomProxyAdmin");
  const proxyAdmin = await ProxyAdmin.deploy();
  await proxyAdmin.waitForDeployment();

  // Deploy transparent proxy
  const TransparentUpgradeableProxy = await ethers.getContractFactory(
    "CustomTransparentUpgradeableProxy"
  );
  const proxy = await TransparentUpgradeableProxy.deploy(
    await implementation.getAddress(),
    await proxyAdmin.getAddress(),
    initData
  );
  await proxy.waitForDeployment();

  // Return contract instance
  return contractFactory.attach(await proxy.getAddress());
}

// Add deployProxy to the ethers global object for use in tests
// This approach avoids TypeScript errors when using the function
const ethersWithExtras = ethers as typeof ethers & {
  deployProxy: typeof deployProxy;
};
ethersWithExtras.deployProxy = deployProxy;

// Also add deployProxy to the ContractFactory prototype
ContractFactory.prototype.deployProxy = async function (args: any[]) {
  return deployProxy(this, args);
};

// Add typings to make TypeScript happy
declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers {
    deployProxy: typeof deployProxy;
  }
}

declare module "ethers" {
  interface ContractFactory {
    deployProxy(args: any[]): Promise<any>;
  }
}
