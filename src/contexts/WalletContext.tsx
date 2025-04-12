
import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if wallet is already connected
    const checkWalletConnection = async () => {
      const isConnected = await isWalletConnected();
      if (isConnected) {
        const address = await getCurrentWalletAddress();
        setWalletAddress(address);
        setConnected(true);
      }
    };
    
    checkWalletConnection();
  }, []);

  const connect = async () => {
    try {
      setConnecting(true);
      const address = await connectWallet();
      
      if (address) {
        setWalletAddress(address);
        setConnected(true);
        toast({
          title: "Wallet Connected",
          description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to wallet",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await disconnectWallet();
      setWalletAddress(null);
      setConnected(false);
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
