
import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getQakulib } from "@/utils/qakulib";
import { BrowserProvider, JsonRpcSigner } from "ethers";

interface WalletContextType {
  walletAddress: string | null;
  ensName: string | null;
  connecting: boolean;
  connected: boolean;
  connect: () => Promise<void>;
  ethProvider: BrowserProvider | null;
  ethersSigner: JsonRpcSigner | null;
  usingExternalWallet: boolean;
}

const WalletContext = createContext<WalletContextType>({
  walletAddress: null,
  ensName: null,
  connecting: false,
  connected: false,
  connect: async () => {},
  ethProvider: null,
  ethersSigner: null,
  usingExternalWallet: false,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [ethProvider, setEthProvider] = useState<BrowserProvider | null>(null);
  const [ethersSigner, setEthersSigner] = useState<JsonRpcSigner | null>(null);
  const [usingExternalWallet, setUsingExternalWallet] = useState(false);
  const { toast } = useToast();

  // Check if window.ethereum is available
  const checkExternalWallet = () => {
    return typeof window !== 'undefined' && window.ethereum !== undefined;
  };

  // Function to lookup ENS name for an address
  const lookupEnsName = async (provider: BrowserProvider, address: string) => {
    try {
      const name = await provider.lookupAddress(address);
      if (name) {
        console.log("ENS name found:", name);
        setEnsName(name);
      }
      return name;
    } catch (error) {
      console.error("Error looking up ENS name:", error);
      return null;
    }
  };

  // Function to connect/refresh the wallet
  const connect = async () => {
    try {
      setConnecting(true);

      // Check if external wallet (window.ethereum) is available
      if (checkExternalWallet()) {
        try {
          console.log("External wallet detected, connecting...");
          const provider = new BrowserProvider(window.ethereum);
          
          // Request account access
          const accounts = await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          
          console.log("Connected to external wallet:", address);
          setWalletAddress(address);
          setEthProvider(provider);
          setEthersSigner(signer);
          setConnected(true);
          setUsingExternalWallet(true);

          // Look up ENS name if available
          await lookupEnsName(provider, address);
          
          // Initialize qakulib with the external wallet
          const qakulib = await getQakulib(signer);
          
          toast({
            title: "Wallet Connected",
            description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
          });
          
          return;
        } catch (error) {
          console.error("Error connecting to external wallet:", error);
          toast({
            title: "Connection Error",
            description: "Could not connect to external wallet",
            variant: "destructive",
          });
        }
      }
      
      // Fallback to qakulib identity if external wallet not available or connection failed
      console.log("Using qakulib identity as fallback");
      setUsingExternalWallet(false);
      const qakulib = await getQakulib();
      
      // Safely check if identity and address exist and address is a function
      if (qakulib && qakulib.identity && qakulib.identity.address && typeof qakulib.identity.address === 'function') {
        try {
          // Call the address function to get the actual address string
          const addressValue = qakulib.identity.address();
          setWalletAddress(addressValue);
          setConnected(true);
          // Clear ENS name when using internal wallet
          setEnsName(null);
        } catch (error) {
          console.error("Error calling qakulib identity address function:", error);
          toast({
            title: "Address Error",
            description: "Could not get wallet address",
            variant: "destructive",
          });
        }
      } else {
        console.log("Qakulib identity or address function not available yet");
      }
    } catch (error) {
      console.error("Error connecting to identity:", error);
      toast({
        title: "Connection Error",
        description: "Could not connect to wallet",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    // Initialize wallet on component mount
    connect();
    
    // Add event listener for account changes if external wallet is available
    if (checkExternalWallet()) {
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        console.log("Account changed:", accounts);
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          
          // Update ENS name for new account
          if (ethProvider) {
            await lookupEnsName(ethProvider, accounts[0]);
          }
        } else {
          // User disconnected their wallet
          setWalletAddress(null);
          setConnected(false);
          setEthProvider(null);
          setEthersSigner(null);
          setEnsName(null);
          setUsingExternalWallet(false);
        }
      });
      
      window.ethereum.on('chainChanged', () => {
        // Handle chain changes by reconnecting
        console.log("Chain changed, reconnecting...");
        connect();
      });
    }
    
    // Cleanup function
    return () => {
      if (checkExternalWallet()) {
        window.ethereum.removeAllListeners?.('accountsChanged');
        window.ethereum.removeAllListeners?.('chainChanged');
      }
    };
  }, [ethProvider]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        ensName,
        connecting,
        connected,
        connect,
        ethProvider,
        ethersSigner,
        usingExternalWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
