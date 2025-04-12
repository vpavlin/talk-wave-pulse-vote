
// Using the locally installed qakulib package
import * as qakulib from "qakulib";

// Initialize the Qakulib instance
let qakulibInstance: any | null = null;

export const getQakulib = () => {
  if (!qakulibInstance) {
    qakulibInstance = new qakulib.default();
  }
  return qakulibInstance;
};

export const connectWallet = async (): Promise<string | null> => {
  try {
    const qakulib = getQakulib();
    const address = await qakulib.connectWallet();
    return address;
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    return null;
  }
};

export const isWalletConnected = async (): Promise<boolean> => {
  try {
    const qakulib = getQakulib();
    return await qakulib.isWalletConnected();
  } catch (error) {
    console.error("Failed to check wallet connection:", error);
    return false;
  }
};

export const getCurrentWalletAddress = async (): Promise<string | null> => {
  try {
    const qakulib = getQakulib();
    return await qakulib.getCurrentWalletAddress();
  } catch (error) {
    console.error("Failed to get current wallet address:", error);
    return null;
  }
};

export const disconnectWallet = async (): Promise<void> => {
  try {
    const qakulib = getQakulib();
    await qakulib.disconnectWallet();
  } catch (error) {
    console.error("Failed to disconnect wallet:", error);
  }
};
