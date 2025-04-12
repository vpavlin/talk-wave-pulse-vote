
import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Simulated wallet interface
interface Wallet {
  address: string;
  connected: boolean;
}

// Local storage key for persisting wallet connection
const WALLET_STORAGE_KEY = "lightning-talk-wallet";

interface WalletContextType {
  walletAddress: string | null;
  connecting: boolean;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  walletAddress: null,
  connecting: false,
  connected: false,
  connect: async () => {},
  disconnect: async () => {},
});

export const useWallet = () => useContext(WalletContext);

// Helper function to generate a random Ethereum-style address
const generateRandomAddress = (): string => {
  const chars = "0123456789abcdef";
  let address = "0x";
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

// Helper function to check if wallet is stored in localStorage
const getSavedWallet = (): Wallet | null => {
  const savedWallet = localStorage.getItem(WALLET_STORAGE_KEY);
  if (savedWallet) {
    try {
      return JSON.parse(savedWallet);
    } catch (e) {
      console.error("Error parsing saved wallet:", e);
    }
  }
  return null;
};

// Helper function to save wallet to localStorage
const saveWallet = (wallet: Wallet | null): void => {
  if (wallet) {
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
  } else {
    localStorage.removeItem(WALLET_STORAGE_KEY);
  }
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if wallet is already connected on app mount
    const savedWallet = getSavedWallet();
    if (savedWallet?.connected) {
      setWalletAddress(savedWallet.address);
      setConnected(true);
    }
  }, []);

  const connect = async () => {
    try {
      setConnecting(true);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate a random wallet address
      const address = generateRandomAddress();
      
      // Save to state and localStorage
      setWalletAddress(address);
      setConnected(true);
      saveWallet({ address, connected: true });
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      });
      
      return address;
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to wallet",
        variant: "destructive",
      });
      return null;
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      // Simulate disconnection delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Clear state and localStorage
      setWalletAddress(null);
      setConnected(false);
      saveWallet(null);
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      });
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: "Could not disconnect wallet",
        variant: "destructive",
      });
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        connecting,
        connected,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
