
declare module '@vpavlin/qakulib' {
  export class Qakulib {
    constructor();
    
    // Wallet methods
    connectWallet(): Promise<string>;
    isWalletConnected(): Promise<boolean>;
    getCurrentWalletAddress(): Promise<string | null>;
    disconnectWallet(): Promise<void>;
    
    // Add other methods as needed
  }
}
