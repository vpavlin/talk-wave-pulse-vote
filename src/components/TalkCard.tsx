import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Trophy, User, Calendar, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { useWallet } from "@/contexts/WalletContext";

interface Talk {
  id: string;
  title: string;
  description: string;
  speaker: string;
  bio?: string;
  votes: number;
  voters?: string[];
  voterAddresses?: string[];
  walletAddress?: string;
  isAuthor?: boolean;
  upvotedByMe?: boolean;
  createdAt: string | number | Date;
  answer?: string;
}

interface TalkCardProps {
  talk: Talk;
  onVote: () => void;
  renderActions?: React.ReactNode;
}

const TalkCard = ({ talk, onVote, renderActions }: TalkCardProps) => {
  const { walletAddress } = useWallet();
  
  const formatDate = (dateString: string | number | Date) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (err) {
      console.error("Date formatting error:", err);
      return "Unknown date";
    }
  };
  
  const hasVoted = React.useMemo(() => {
    if (talk.voterAddresses && walletAddress) {
      return talk.voterAddresses.some(
        voter => voter.toLowerCase() === walletAddress.toLowerCase()
      );
    }
    
    if (talk.upvotedByMe) {
      return true;
    }
    
    return false;
  }, [talk, walletAddress]);
  
  const isMyTalk = React.useMemo(() => {
    return talk.isAuthor === true || 
           (talk.walletAddress && walletAddress && 
            talk.walletAddress.toLowerCase() === walletAddress.toLowerCase());
  }, [talk, walletAddress]);

  return (
    <Card className="overflow-hidden border-purple-800/30 dark:border-purple-700/30 bg-white/90 dark:bg-gray-800/70 backdrop-blur hover:shadow-lg transition-shadow talk-card">
      <CardHeader className="pb-2 relative">
        {talk.answer && (
          <Badge className="absolute top-2 right-2 bg-green-600 text-white flex items-center gap-1 p-1">
            <CheckCheck className="h-3 w-3" /> Accepted
          </Badge>
        )}
        <CardTitle className="text-xl text-purple-800 dark:text-purple-300 leading-tight">
          {talk.title}
        </CardTitle>
        <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{talk.speaker}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(talk.createdAt)}</span>
          </div>
          {isMyTalk && (
            <Badge variant="outline" className="bg-purple-100/50 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700">
              Your Talk
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <div className="prose dark:prose-invert prose-sm max-w-none">
          <ReactMarkdown>{talk.description}</ReactMarkdown>
        </div>
        
        {talk.bio && (
          <div className="mt-4 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md">
            <div className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">About the speaker:</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 prose dark:prose-invert prose-sm max-w-none">
              <ReactMarkdown>{talk.bio}</ReactMarkdown>
            </div>
          </div>
        )}
        
        {talk.answer && (
          <div className="mt-4 bg-green-100 dark:bg-green-900/30 p-3 rounded-md border border-green-200 dark:border-green-800/50">
            <div className="font-medium text-sm text-green-800 dark:text-green-300 mb-1 flex items-center">
              <Trophy className="h-4 w-4 mr-1" /> Talk Accepted
            </div>
            <div className="text-sm text-green-700 dark:text-green-400">
              {talk.answer}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-3 pb-3 gap-2">
        <div className="flex items-center gap-1">
          <ThumbsUp className={`h-5 w-5 ${hasVoted ? 'text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400' : 'text-gray-500 dark:text-gray-400'}`} />
          <span className="font-medium ml-1 text-purple-600 dark:text-purple-400">{talk.votes}</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">votes</span>
        </div>
        
        <div className="flex items-center gap-2">
          {renderActions}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onVote}
            disabled={hasVoted || !!talk.answer}
            className={`
              flex items-center justify-center min-w-[90px] 
              ${(hasVoted || talk.answer) 
                ? "bg-purple-100 text-purple-800 border-purple-300 cursor-not-allowed dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700" 
                : "border-purple-400 text-purple-700 hover:bg-purple-100/70 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/50"
              }
            `}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            {(hasVoted || talk.answer) ? "Voted" : "Vote"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TalkCard;
