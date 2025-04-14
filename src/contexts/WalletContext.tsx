import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getQakulib } from "@/utils/qakulib";

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
    const checkQakulibIdentity = async () => {
      try {
        const qakulib = await getQakulib();
        if (qakulib.identity?.address) {
          setWalletAddress(qakulib.identity.address);
          setConnected(true);
        }
      } catch (error) {
        console.error("Error checking qakulib identity:", error);
      }
    };
    
    checkQakulibIdentity();
  }, []);

  const connect = async (): Promise<void> => {
    try {
      setConnecting(true);
      
      const qakulib = await getQakulib();
      
      if (qakulib.identity?.address) {
        setWalletAddress(qakulib.identity.address);
        setConnected(true);
      } else {
        await qakulib.refresh();
        
        if (qakulib.identity?.address) {
          setWalletAddress(qakulib.identity.address);
          setConnected(true);
          
          toast({
            title: "Connected",
            description: `Connected with ID ${qakulib.identity.address.substring(0, 6)}...${qakulib.identity.address.substring(qakulib.identity.address.length - 4)}`,
          });
        } else {
          throw new Error("Failed to get qakulib identity");
        }
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to qakulib identity",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      setWalletAddress(null);
      setConnected(false);
      
      toast({
        title: "Disconnected",
        description: "Your connection has been reset",
      });
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: "Could not disconnect",
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
