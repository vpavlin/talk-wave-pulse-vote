
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Clock, Wallet, ChevronDown, ChevronUp, User, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Talk } from "@/services/eventService";
import { useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface TalkCardProps {
  talk: Talk;
  onVote: () => void;
  showFullDescription?: boolean;
}

const TalkCard = ({ talk, onVote, showFullDescription = false }: TalkCardProps) => {
  const [isExpanded, setIsExpanded] = useState(showFullDescription);
  
  const getInitials = (name: string | undefined) => {
    if (!name) return "?";
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  const formatWalletAddress = (address: string | undefined) => {
    if (!address) return "Unknown";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Function to extract the first line of text
  const getFirstLine = (text: string | undefined) => {
    if (!text) return "No description available";
    
    const firstLine = text.split('\n')[0].trim();
    // If first line is too long, truncate it
    if (firstLine.length > 100) {
      return firstLine.substring(0, 100) + '...';
    }
    return firstLine;
  };

  // Ensure description is not undefined before processing
  const description = isExpanded 
    ? (talk.description || "No description available") 
    : getFirstLine(talk.description);
  
  // Check if there's more content to show (only if description exists)
  const hasMoreContent = talk.description 
    ? talk.description.length > getFirstLine(talk.description).length
    : false;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-gray-700 bg-gray-800 card-hover h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl font-bold text-gray-100">
            {talk.title || "Untitled Talk"}
          </CardTitle>
          <Badge variant="outline" className="text-base px-3 py-1 bg-gray-700/60 text-gray-200 border-gray-600">
            {talk.votes} {talk.votes === 1 ? 'vote' : 'votes'}
          </Badge>
        </div>
        <CardDescription className="flex items-center mt-2 text-base text-gray-300">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center cursor-pointer">
                <Avatar className="h-8 w-8 mr-2 border-2 border-gray-700">
                  <AvatarFallback className="bg-gray-700 text-gray-200 font-semibold">
                    {getInitials(talk.speaker)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{talk.speaker || "Anonymous"}</span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-gray-800 border-gray-700 text-gray-200">
              <div className="flex justify-between space-x-4">
                <Avatar className="h-12 w-12 border-2 border-gray-700">
                  <AvatarFallback className="bg-gray-700 text-gray-200 font-semibold text-lg">
                    {getInitials(talk.speaker)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-md font-semibold text-gray-100">{talk.speaker || "Anonymous"}</h4>
                  <div className="flex items-center pt-2">
                    <Users className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="text-xs text-gray-400">Speaker</span>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                {talk.bio ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">{talk.bio}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No bio available</p>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
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
      <CardContent className="flex-grow">
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
      <CardFooter className="border-t border-gray-700/50 pt-3 pb-3 mt-auto">
        <Button 
          variant="outline" 
          size="lg" 
          className="ml-auto text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-gray-100 focus-ring"
          onClick={onVote}
          aria-label={`Upvote ${talk.title} by ${talk.speaker || "Anonymous"}`}
        >
          <ThumbsUp className="mr-2 h-5 w-5" />
          Upvote
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TalkCard;
