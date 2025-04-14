
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Clock } from "lucide-react";
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
    <Card className="border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl font-bold text-black dark:text-white">
            {talk.title}
          </CardTitle>
          <Badge 
            variant="outline" 
            className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700"
          >
            {talk.votes} {talk.votes === 1 ? 'vote' : 'votes'}
          </Badge>
        </div>
        <CardDescription className="flex items-center mt-2 text-base text-gray-700 dark:text-gray-300">
          <Avatar className="h-8 w-8 mr-2 border-2 border-gray-300 dark:border-gray-700">
            <AvatarFallback className="bg-gray-200 text-black font-semibold dark:bg-gray-800 dark:text-white">
              {getInitials(talk.speaker)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{talk.speaker}</span>
          <span className="flex items-center text-sm text-gray-500 dark:text-gray-400 ml-3">
            <Clock className="h-4 w-4 mr-1" />
            {getTimeAgo(talk.createdAt)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed">
          {talk.description}
        </p>
      </CardContent>
      <CardFooter className="border-t border-gray-200 dark:border-gray-800 pt-3 pb-3">
        <Button 
          variant="outline" 
          size="lg" 
          className="ml-auto text-black border-black hover:bg-gray-100 dark:text-white dark:border-white dark:hover:bg-gray-900 focus-ring"
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

