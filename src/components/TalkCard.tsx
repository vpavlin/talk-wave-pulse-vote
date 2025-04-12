
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Talk } from "@/services/eventService";

interface TalkCardProps {
  talk: Talk;
  onVote: () => void;
}

const TalkCard = ({ talk, onVote }: TalkCardProps) => {
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

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md border-purple-100 dark:border-purple-900 bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-lg font-semibold text-purple-900 dark:text-purple-300">{talk.title}</CardTitle>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-200 dark:border-purple-800">
            {talk.votes} votes
          </Badge>
        </div>
        <CardDescription className="flex items-center mt-1 dark:text-gray-300">
          <Avatar className="h-5 w-5 mr-1">
            <AvatarFallback className="bg-purple-200 text-purple-700 text-xs dark:bg-purple-900 dark:text-purple-200">
              {getInitials(talk.speaker)}
            </AvatarFallback>
          </Avatar>
          <span>{talk.speaker}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">• {getTimeAgo(talk.createdAt)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300">{talk.description}</p>
      </CardContent>
      <CardFooter className="border-t border-purple-50 dark:border-purple-900/50 pt-3 pb-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-auto text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/40"
          onClick={onVote}
        >
          <ThumbsUp className="mr-1 h-4 w-4" />
          Upvote
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TalkCard;
