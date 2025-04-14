
import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getQakulib } from "@/utils/qakulib";

interface WalletContextType {
  walletAddress: string | null;
  connecting: boolean;
  connected: boolean;
  connect: () => Promise<void>; // Added connect method to the interface
}

const WalletContext = createContext<WalletContextType>({
  walletAddress: null,
  connecting: false,
  connected: false,
  connect: async () => {}, // Added empty implementation for default context
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();

  // Function to connect/refresh the wallet
  const connect = async () => {
    try {
      setConnecting(true);
      const qakulib = await getQakulib();
      
      if (qakulib.identity?.address) {
        const address = qakulib.identity.address;
        // Handle the case where address might be a function or a string
        const addressValue = typeof address === 'function' ? address() : address;
        setWalletAddress(addressValue);
        setConnected(true);
      }
    } catch (error) {
      console.error("Error connecting to qakulib identity:", error);
      toast({
        title: "Connection Error",
        description: "Could not connect to qakulib identity",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    // Initialize wallet on component mount
    connect();
  }, [toast]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        connecting,
        connected,
        connect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
