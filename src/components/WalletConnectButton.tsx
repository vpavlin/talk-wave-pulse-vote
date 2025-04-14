
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { Loader2, LogOut, Wallet } from "lucide-react";

const WalletConnectButton = () => {
  const { walletAddress, connecting, connected, connect, disconnect } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      {!connected ? (
        <Button 
          variant="outline" 
          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          onClick={connect}
          disabled={connecting}
        >
          {connecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </>
          )}
        </Button>
      ) : (
        <Button 
          variant="outline" 
          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          onClick={disconnect}
        >
          <span className="mr-2">{formatAddress(walletAddress || '')}</span>
          <LogOut className="h-4 w-4" />
        </Button>
      )}
    </>
  );
};

export default WalletConnectButton;
