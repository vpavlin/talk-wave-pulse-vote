
import React from "react";
import { MessageSquarePlus, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";

interface EventActionsProps {
  isSubmitEnabled: boolean;
  isWalletConnected: boolean;
  onOpenSubmitDialog: () => void;
  onGenerateSuggestion: () => void;
  isGeneratingSuggestion: boolean;
}

const EventActions = ({ 
  isSubmitEnabled, 
  isWalletConnected, 
  onOpenSubmitDialog, 
  onGenerateSuggestion, 
  isGeneratingSuggestion 
}: EventActionsProps) => {
  return (
    <CardContent>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Button 
          onClick={onOpenSubmitDialog}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700 text-lg px-6 py-6 h-auto focus-ring"
          disabled={!isWalletConnected || !isSubmitEnabled}
          size="lg"
          aria-label="Submit a lightning talk"
        >
          <MessageSquarePlus className="mr-2 h-6 w-6" />
          Submit a Lightning Talk
        </Button>
        
        <Button
          onClick={onGenerateSuggestion}
          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 dark:from-amber-600 dark:to-yellow-600 dark:hover:from-amber-700 dark:hover:to-yellow-700 text-lg px-6 py-6 h-auto focus-ring text-white"
          disabled={isGeneratingSuggestion || !isSubmitEnabled}
          size="lg"
          aria-label="Generate AI talk suggestion"
        >
          <Sparkles className="mr-2 h-6 w-6" />
          {isGeneratingSuggestion ? "Generating..." : "Generate Talk Suggestion"}
        </Button>
      </div>
      
      {!isWalletConnected && (
        <p className="mt-2 text-amber-600 dark:text-amber-400 text-sm flex items-center">
          <AlertCircle className="inline-block mr-1 h-4 w-4" />
          Connect your wallet to submit a talk
        </p>
      )}
      
      {!isSubmitEnabled && (
        <p className="mt-2 text-amber-600 dark:text-amber-400 text-sm flex items-center">
          <AlertCircle className="inline-block mr-1 h-4 w-4" />
          This event is closed for new submissions
        </p>
      )}
    </CardContent>
  );
};

export default EventActions;
