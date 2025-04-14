
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Clock, Wallet, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Talk } from "@/services/eventService";
import { useState } from "react";

interface TalkCardProps {
  talk: Talk;
  onVote: () => void;
  showFullDescription?: boolean;
}

const TalkCard = ({ talk, onVote, showFullDescription = false }: TalkCardProps) => {
  const [isExpanded, setIsExpanded] = useState(showFullDescription);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const formatWalletAddress = (address: string | undefined) => {
    if (!address) return "Unknown";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Function to extract the first line of text
  const getFirstLine = (text: string) => {
    const firstLine = text.split('\n')[0].trim();
    // If first line is too long, truncate it
    if (firstLine.length > 100) {
      return firstLine.substring(0, 100) + '...';
    }
    return firstLine;
  };

  // Get appropriate description based on expanded state
  const description = isExpanded ? talk.description : getFirstLine(talk.description);
  
  // Check if there's more content to show
  const hasMoreContent = talk.description.length > getFirstLine(talk.description).length;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-gray-700 bg-gray-800 card-hover">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl font-bold text-gray-100">
            {talk.title}
          </CardTitle>
          <Badge variant="outline" className="text-base px-3 py-1 bg-gray-700/60 text-gray-200 border-gray-600">
            {talk.votes} {talk.votes === 1 ? 'vote' : 'votes'}
          </Badge>
        </div>
        <CardDescription className="flex items-center mt-2 text-base text-gray-300">
          <Avatar className="h-8 w-8 mr-2 border-2 border-gray-700">
            <AvatarFallback className="bg-gray-700 text-gray-200 font-semibold">
              {getInitials(talk.speaker)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{talk.speaker}</span>
          <span className="flex items-center text-sm text-gray-400 ml-3">
            <Clock className="h-4 w-4 mr-1" />
            {getTimeAgo(talk.createdAt)}
          </span>
        </CardDescription>
        {talk.walletAddress && (
          <div className="mt-1 flex items-center text-xs text-gray-400">
            <Wallet className="h-3 w-3 mr-1" />
            <span>{formatWalletAddress(talk.walletAddress)}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-gray-300 text-base leading-relaxed prose dark:prose-invert prose-p:my-2 max-w-none">
          {isExpanded ? (
            <ReactMarkdown>{description}</ReactMarkdown>
          ) : (
            <p>{description}</p>
          )}
        </div>
        
        {hasMoreContent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-gray-400 hover:text-gray-200 p-0 h-auto"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Show less" : "Show more"}
          >
            {isExpanded ? (
              <>Show less <ChevronUp className="ml-1 h-4 w-4" /></>
            ) : (
              <>Show more <ChevronDown className="ml-1 h-4 w-4" /></>
            )}
          </Button>
        )}
      </CardContent>
      <CardFooter className="border-t border-gray-700/50 pt-3 pb-3">
        <Button 
          variant="outline" 
          size="lg" 
          className="ml-auto text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-gray-100 focus-ring"
          onClick={onVote}
          aria-label={`Upvote ${talk.title} by ${talk.speaker}`}
        >
          <ThumbsUp className="mr-2 h-5 w-5" />
          Upvote
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TalkCard;
