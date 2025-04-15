
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, MessageSquare, Wallet, User, MessageSquarePlus, Vote, PresentationIcon, Lock, ChevronDown, ChevronUp, BellRing } from "lucide-react";
import { format, isValid } from "date-fns";
import { Link } from "react-router-dom";
import { Event } from "@/services/eventService";
import { useWallet } from "@/contexts/WalletContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface EventListProps {
  events: Event[];
}

const EventList = ({ events }: EventListProps) => {
  const [filter, setFilter] = useState("all");
  const [isClosedEventsOpen, setIsClosedEventsOpen] = useState(false);
  const { connected, walletAddress } = useWallet();
  
  const activeEvents = events.filter(event => event.enabled !== false);
  const closedEvents = events.filter(event => event.enabled === false);
  
  const filteredActiveEvents = activeEvents.filter(event => {
    if (filter === "all") return true;
    if (filter === "upcoming") {
      const eventDate = event.eventDate 
        ? new Date(event.eventDate) 
        : event.date ? new Date(event.date) : new Date();
      return eventDate >= new Date();
    }
    if (filter === "created") {
      return event.isCreator || false;
    }
    if (filter === "submitted") {
      return event.talks && event.talks.some(talk => talk.isAuthor || false);
    }
    if (filter === "voted") {
      return event.talks && event.talks.some(talk => talk.hasOwnProperty('upvotedByMe') && talk.upvotedByMe);
    }
    if (filter === "announced") {
      return event.announced || false;
    }
    return false;
  });
  
  const filteredClosedEvents = closedEvents.filter(event => {
    if (filter === "all") return true;
    if (filter === "upcoming") return false;
    if (filter === "created") {
      return event.isCreator || false;
    }
    if (filter === "submitted") {
      return event.talks && event.talks.some(talk => talk.isAuthor || false);
    }
    if (filter === "voted") {
      return event.talks && event.talks.some(talk => talk.hasOwnProperty('upvotedByMe') && talk.upvotedByMe);
    }
    if (filter === "announced") {
      return event.announced || false;
    }
    return false;
  });

  const formatWalletAddress = (address: string | undefined) => {
    if (!address) return "Unknown";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getFirstLine = (text: string) => {
    if (!text) return "";
    const firstLine = text.split('\n')[0].trim();
    if (firstLine.length > 120) {
      return firstLine.substring(0, 120) + '...';
    }
    return firstLine;
  };

  const safelyFormatDate = (dateValue: string | undefined) => {
    if (!dateValue) return "Unknown date";
    
    const date = new Date(dateValue);
    if (!isValid(date)) return "Invalid date";
    
    try {
      return format(date, "MMM d, yy");
    } catch (error) {
      console.error("Error formatting date:", error, "Date value:", dateValue);
      return "Date error";
    }
  };

  // Determine if an event is from the announcement channel
  const isAnnouncedEvent = (event: Event) => {
    // Events fetched directly from the blockchain typically have a qaId property
    // while events from the announcement channel don't
    return event.announed
  };

  const renderEventCard = (event: Event) => {
    const announced = isAnnouncedEvent(event);
    
    return (
      <Card 
        key={event.id} 
        className={`overflow-hidden transition-all duration-300 hover:shadow-xl border-gray-200 dark:border-gray-700 card-hover flex flex-col h-full ${
          announced ? "border-l-4 border-l-cyan-500 dark:border-l-cyan-600" : ""
        }`}
      >
        <CardHeader className={`pb-3 ${
          announced 
            ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-900/20 dark:to-blue-900/20" 
            : "bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-900/20 dark:to-indigo-900/20"
        }`}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-2">
              <CardTitle className={`text-2xl font-bold ${
                announced ? "text-cyan-800 dark:text-cyan-300" : "text-purple-800 dark:text-purple-300"
              }`}>
                {event.title}
                {event.enabled === false && (
                  <Badge className="ml-2 bg-gray-600 text-white">
                    <Lock className="h-3 w-3 mr-1" />
                    Closed
                  </Badge>
                )}
                {announced && (
                  <Badge variant="outline" className="ml-2 border-cyan-500 text-cyan-700 dark:border-cyan-600 dark:text-cyan-300">
                    <BellRing className="h-3 w-3 mr-1" />
                    Announced
                  </Badge>
                )}
              </CardTitle>
              <Badge className={`date-badge whitespace-nowrap flex-shrink-0 ${
                announced ? "bg-cyan-600 hover:bg-cyan-700" : "bg-purple-600 hover:bg-purple-700"
              }`}>
                <Calendar className="h-4 w-4 mr-1" />
                {safelyFormatDate(event.eventDate || (event.date ? String(event.date) : undefined))}
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
        <CardContent className="pt-4 bg-white dark:bg-gray-800 flex flex-col flex-grow">
          <div className="mb-3 flex gap-2 items-center">
            <MessageSquare className={`h-5 w-5 ${
              announced ? "text-cyan-600 dark:text-cyan-400" : "text-purple-600 dark:text-purple-400"
            }`} />
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
              {(event.talks && event.talks.length) || 0} {(event.talks && event.talks.length === 1) ? 'talk' : 'talks'} submitted
            </p>
          </div>
          <div className="mt-auto pt-2">
            <Link to={`/event/${event.id}`} className="block">
              <Button 
                variant="outline" 
                size="lg" 
                className={`w-full focus-ring text-lg ${
                  announced 
                    ? "border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-700 dark:text-cyan-300 dark:hover:bg-cyan-900/30" 
                    : "border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/30"
                } group`}
              >
                View Event
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
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
            variant={filter === "announced" ? "default" : "outline"}
            onClick={() => setFilter("announced")}
            className={filter === "announced" ? "bg-accent hover:bg-accent/90" : ""}
            aria-pressed={filter === "announced"}
          >
            <BellRing className="mr-1 h-4 w-4" />
            Announced
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
          
          {connected && (
            <Link to="/my-talks">
              <Button variant="outline" className="ml-1 border-purple-500 text-purple-400 hover:bg-purple-950 hover:text-purple-200">
                <PresentationIcon className="mr-1 h-4 w-4" />
                My Talks
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {filteredActiveEvents.length === 0 && filteredClosedEvents.length === 0 ? (
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
        <div className="space-y-8">
          {filteredActiveEvents.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Active Events
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActiveEvents.map(renderEventCard)}
              </div>
            </div>
          )}
          
          {filteredClosedEvents.length > 0 && (
            <Collapsible 
              open={isClosedEventsOpen} 
              onOpenChange={setIsClosedEventsOpen}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex justify-between items-center w-full p-4 text-left font-semibold text-gray-700 dark:text-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>Closed Events ({filteredClosedEvents.length})</span>
                  </div>
                  {isClosedEventsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClosedEvents.map(renderEventCard)}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}
    </div>
  );
};

export default EventList;
