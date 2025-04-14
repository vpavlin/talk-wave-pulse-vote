import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, MessageSquare, Wallet, User, MessageSquarePlus, Vote } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Event } from "@/services/eventService";
import { useWallet } from "@/contexts/WalletContext";
import { getQakulib } from "@/utils/qakulib";

interface EventListProps {
  events: Event[];
}

const EventList = ({ events }: EventListProps) => {
  const [filter, setFilter] = useState("all");
  const { connected } = useWallet();
  const [qakulibAddress, setQakulibAddress] = useState<string | null>(null);
  
  useState(() => {
    const fetchQakulibAddress = async () => {
      const qakulib = await getQakulib();
      const address = qakulib.identity?.address || '';
      setQakulibAddress(address);
    };
    
    if (connected) {
      fetchQakulibAddress();
    }
  });
  
  const filteredEvents = events.filter(event => {
    if (filter === "all") return true;
    if (filter === "upcoming") {
      const eventDate = event.eventDate 
        ? new Date(event.eventDate) 
        : new Date(event.date);
      return eventDate >= new Date();
    }
    if (filter === "created") {
      return event.isCreator;
    }
    if (filter === "submitted") {
      return event.talks.some(talk => talk.isAuthor);
    }
    if (filter === "voted") {
      return event.talks.some(talk => talk.upvotedByMe);
    }
    return false;
  });

  const formatWalletAddress = (address: string | undefined) => {
    if (!address) return "Unknown";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getFirstLine = (text: string) => {
    const firstLine = text.split('\n')[0].trim();
    if (firstLine.length > 120) {
      return firstLine.substring(0, 120) + '...';
    }
    return firstLine;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Events</h2>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-accent hover:bg-accent/90" : ""}
            aria-pressed={filter === "all"}
          >
            All Events
          </Button>
          <Button 
            variant={filter === "upcoming" ? "default" : "outline"}
            onClick={() => setFilter("upcoming")}
            className={filter === "upcoming" ? "bg-accent hover:bg-accent/90" : ""}
            aria-pressed={filter === "upcoming"}
          >
            Upcoming
          </Button>
          <Button 
            variant={filter === "created" ? "default" : "outline"}
            onClick={() => setFilter("created")}
            className={filter === "created" ? "bg-accent hover:bg-accent/90" : ""}
            aria-pressed={filter === "created"}
            disabled={!connected}
          >
            <User className="mr-1 h-4 w-4" />
            Created
          </Button>
          <Button 
            variant={filter === "submitted" ? "default" : "outline"}
            onClick={() => setFilter("submitted")}
            className={filter === "submitted" ? "bg-accent hover:bg-accent/90" : ""}
            aria-pressed={filter === "submitted"}
            disabled={!connected}
          >
            <MessageSquarePlus className="mr-1 h-4 w-4" />
            Submitted
          </Button>
          <Button 
            variant={filter === "voted" ? "default" : "outline"}
            onClick={() => setFilter("voted")}
            className={filter === "voted" ? "bg-accent hover:bg-accent/90" : ""}
            aria-pressed={filter === "voted"}
            disabled={!connected}
          >
            <Vote className="mr-1 h-4 w-4" />
            Voted
          </Button>
        </div>
      </div>
      
      {filteredEvents.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            {!connected && (filter === "created" || filter === "submitted" || filter === "voted") ? (
              <p className="text-lg text-gray-500 dark:text-gray-400">Connect your wallet to see your events.</p>
            ) : (
              <p className="text-lg text-gray-500 dark:text-gray-400">
                No events found for this filter. 
                {filter === "created" && "Create a new event to get started!"}
                {filter === "submitted" && "Submit talks to events to see them here!"}
                {filter === "voted" && "Vote on talks to see events here!"}
                {filter === "upcoming" && "No upcoming events found."}
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden transition-all duration-300 hover:shadow-xl border-gray-200 dark:border-gray-700 card-hover">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-900/20 dark:to-indigo-900/20 pb-3">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-2xl text-purple-800 dark:text-purple-300 font-bold">
                      {event.title}
                    </CardTitle>
                    <Badge className="date-badge">
                      <Calendar className="h-4 w-4" />
                      {event.eventDate 
                        ? format(new Date(event.eventDate), "MMM d, yyyy")
                        : format(new Date(event.date), "MMM d, yyyy")}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1 text-base dark:text-gray-300">
                    {getFirstLine(event.description)}
                  </CardDescription>
                  {event.ownerAddress && (
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Wallet className="h-3 w-3 mr-1" />
                      <span>Created by: {formatWalletAddress(event.ownerAddress)}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 bg-white dark:bg-gray-800">
                <div className="mb-3 flex gap-2 items-center">
                  <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                    {event.talks.length} {event.talks.length === 1 ? 'talk' : 'talks'} submitted
                  </p>
                </div>
                <Link to={`/event/${event.id}`} className="block">
                  <Button variant="outline" size="lg" className="w-full mt-2 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/30 group text-lg focus-ring">
                    View Event
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
