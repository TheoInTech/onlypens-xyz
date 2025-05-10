import fs from "fs";
import path from "path";

// List of contracts to extract ABIs for
const contractNames = [
  "OnlyPens",
  "OnlyPensHelpers",
  "CustomProxyAdmin",
  "CustomTransparentUpgradeableProxy",
];

async function extractAbis() {
  console.log("Extracting ABIs from compiled contracts...");

  // Create directory if it doesn't exist
  const abiDir = path.join(__dirname, "../abis");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  // Extract ABIs for each contract
  contractNames.forEach((contractName) => {
    try {
      // Path to the compiled contract artifact
      const artifactPath = path.join(
        __dirname,
        `../artifacts/contracts/${contractName}.sol/${contractName}.json`
      );

      // Read and parse the artifact file
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

      // Extract ABI
      const abi = artifact.abi;

      // Write ABI to file
      const abiPath = path.join(abiDir, `${contractName}.json`);
      fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));

      console.log(`✅ Extracted ABI for ${contractName}`);
    } catch (error) {
      console.error(`❌ Failed to extract ABI for ${contractName}:`, error);
    }
  });

  console.log("ABI extraction complete! Files saved to the 'abis' directory.");
}

// Run the extraction
extractAbis().catch((error) => {
  console.error("Error extracting ABIs:", error);
  process.exitCode = 1;
});
