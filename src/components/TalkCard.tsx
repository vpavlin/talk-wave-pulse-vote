
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
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-purple-200 dark:border-purple-900 bg-white dark:bg-gray-800 card-hover">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-300">
            {talk.title}
          </CardTitle>
          <Badge variant="outline" className="text-base px-3 py-1 bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-800">
            {talk.votes} {talk.votes === 1 ? 'vote' : 'votes'}
          </Badge>
        </div>
        <CardDescription className="flex items-center mt-2 text-base dark:text-gray-300">
          <Avatar className="h-8 w-8 mr-2 border-2 border-purple-200 dark:border-purple-800">
            <AvatarFallback className="bg-purple-200 text-purple-700 font-semibold dark:bg-purple-900 dark:text-purple-200">
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
        <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
          {talk.description}
        </p>
      </CardContent>
      <CardFooter className="border-t border-purple-100 dark:border-purple-900/50 pt-3 pb-3">
        <Button 
          variant="outline" 
          size="lg" 
          className="ml-auto text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/40 focus-ring"
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
