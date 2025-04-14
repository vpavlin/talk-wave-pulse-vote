
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { UserCircle } from "lucide-react";

const WalletConnectButton = () => {
  const { walletAddress, connecting, connected } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
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
      ) : (
        <Button 
          size="lg"
          disabled={true}
          className="text-lg px-6 py-6 h-auto bg-gray-400 text-white"
        >
          <UserCircle className="mr-2 h-5 w-5" />
          Loading Identity...
        </Button>
      )}
    </>
  );
};

export default WalletConnectButton;
