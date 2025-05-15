
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Twitter, Hash, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";

interface EventHeaderProps {
  onCopyLink: () => void;
  onShareTwitter: () => void;
  onShareFarcaster: () => void;
  copied: boolean;
}

const EventHeader = ({ onCopyLink, onShareTwitter, onShareFarcaster, copied }: EventHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <Link to="/">
        <Button 
          variant="outline" 
          size="lg" 
          className="text-lg text-gray-700 dark:text-gray-300 focus-ring"
          aria-label="Back to events list"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Events
        </Button>
      </Link>
      <div className="flex space-x-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onCopyLink}
            className="bg-purple-800/30 border-purple-700/50 hover:bg-purple-700/50 text-purple-100 focus-ring"
            aria-label="Copy event link"
          >
            {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onShareTwitter}
            className="bg-blue-600/30 border-blue-500/50 hover:bg-blue-600/50 text-blue-100 focus-ring"
            aria-label="Share on Twitter"
          >
            <Twitter className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onShareFarcaster}
            className="bg-violet-600/30 border-violet-500/50 hover:bg-violet-600/50 text-violet-100 focus-ring"
            aria-label="Share on Farcaster"
          >
            <Hash className="h-5 w-5" />
          </Button>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
};

export default EventHeader;
