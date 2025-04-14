
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { Loader2, LogOut, UserCircle } from "lucide-react";

const WalletConnectButton = () => {
  const { walletAddress, connecting, connected, connect, disconnect } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      {!connected ? (
        <Button 
          size="lg"
          className="text-lg px-6 py-6 h-auto bg-purple-600 hover:bg-purple-700 text-white"
          onClick={connect}
          disabled={connecting}
        >
          {connecting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <UserCircle className="mr-2 h-5 w-5" />
              Connect Identity
            </>
          )}
        </Button>
      ) : (
        <Button 
          size="lg"
          className="text-lg px-6 py-6 h-auto bg-purple-600 hover:bg-purple-700 text-white"
          onClick={disconnect}
        >
          <span className="mr-2">{formatAddress(walletAddress || '')}</span>
          <LogOut className="h-5 w-5" />
        </Button>
      )}
    </>
  );
};

export default WalletConnectButton;
