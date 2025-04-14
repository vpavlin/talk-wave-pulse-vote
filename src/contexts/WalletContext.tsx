
import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getQakulib } from "@/utils/qakulib";

interface WalletContextType {
  walletAddress: string | null;
  connecting: boolean;
  connected: boolean;
}

const WalletContext = createContext<WalletContextType>({
  walletAddress: null,
  connecting: false,
  connected: false,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeQakulib = async () => {
      try {
        setConnecting(true);
        const qakulib = await getQakulib();
        
        if (qakulib.identity?.address) {
          const address = qakulib.identity.address;
          setWalletAddress(typeof address === 'function' ? address() : address);
          setConnected(true);
        }
      } catch (error) {
        console.error("Error initializing qakulib:", error);
        toast({
          title: "Connection Error",
          description: "Could not connect to qakulib identity",
          variant: "destructive",
        });
      } finally {
        setConnecting(false);
      }
    };
    
    initializeQakulib();
  }, [toast]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        connecting,
        connected,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
