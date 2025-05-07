
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { UserCircle, Wallet } from "lucide-react";

const WalletConnectButton = () => {
  const { walletAddress, connecting, connected, connect } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleConnect = async () => {
    if (!connected && !connecting) {
      await connect();
    }
  };

  return (
    <>
      {connected && walletAddress ? (
        <Button 
          size="lg"
          className="text-lg px-6 py-6 h-auto bg-purple-600 hover:bg-purple-700 text-white"
        >
          <UserCircle className="mr-2 h-5 w-5" />
          <span>{formatAddress(walletAddress)}</span>
        </Button>
      ) : connecting ? (
        <Button 
          size="lg"
          disabled={true}
          className="text-lg px-6 py-6 h-auto bg-gray-400 text-white"
        >
          <UserCircle className="mr-2 h-5 w-5" />
          Loading Identity...
        </Button>
      ) : (
        <Button 
          size="lg"
          onClick={handleConnect}
          className="text-lg px-6 py-6 h-auto bg-green-600 hover:bg-green-700 text-white"
        >
          <Wallet className="mr-2 h-5 w-5" />
          Connect Wallet
        </Button>
      )}
    </>
  );
};

export default WalletConnectButton;
