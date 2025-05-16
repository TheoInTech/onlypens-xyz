import { Address } from "viem";

interface IConfig {
  onlyPensAddress: Address;
  usdcAddress: Address;
}

const config = {
  sepolia: {
    onlyPensAddress: "0x8d7c222d2F0D8bf9ceFbA02Cd01ab46C47C33062",
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  },
  mainnet: {
    onlyPensAddress: "0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4",
    usdcAddress: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  },
};

const getConfig = () => {
  const env =
    process.env.NEXT_PUBLIC_BLOCKCHAIN_ENV === "mainnet"
      ? "mainnet"
      : "sepolia";
  return config[env] as IConfig;
};

export default getConfig;
