import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, MessageSquare, Wallet, User, MessageSquarePlus, Vote, PresentationIcon, Lock, ChevronDown, ChevronUp, BellRing, BellOff, Search, EyeOff, Eye, Megaphone } from "lucide-react";
import { format, isValid } from "date-fns";
import { Link } from "react-router-dom";
import { Event } from "@/services/eventService";
import { useWallet } from "@/contexts/WalletContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { getQakulib } from "@/utils/qakulib";

interface EventListProps {
  events: Event[];
  onAnnounceEvent?: (eventId: string) => Promise<boolean>;
}

const HIDDEN_EVENTS_KEY = "lightning-talk-hidden-events";

const EventList = ({ events, onAnnounceEvent }: EventListProps) => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isClosedEventsOpen, setIsClosedEventsOpen] = useState(false);
  const [hiddenEventIds, setHiddenEventIds] = useState<string[]>([]);
  const [showHiddenEvents, setShowHiddenEvents] = useState(false);
  const [announcingEventId, setAnnouncingEventId] = useState<string | null>(null);
  const { connected, walletAddress } = useWallet();
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      search: "",
    },
  });
  
  useEffect(() => {
    const savedHiddenEvents = localStorage.getItem(HIDDEN_EVENTS_KEY);
    if (savedHiddenEvents) {
      try {
        const parsedHiddenEvents = JSON.parse(savedHiddenEvents);
        if (Array.isArray(parsedHiddenEvents)) {
          setHiddenEventIds(parsedHiddenEvents);
        }
      } catch (error) {
        console.error("Error parsing hidden events from localStorage:", error);
      }
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem(HIDDEN_EVENTS_KEY, JSON.stringify(hiddenEventIds));
  }, [hiddenEventIds]);
  
  const toggleHideEvent = (eventId: string) => {
    setHiddenEventIds(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };
  
  const handleAnnounceEvent = async (eventId: string) => {
    if (!onAnnounceEvent) return;
    
    setAnnouncingEventId(eventId);
    try {
      const success = await onAnnounceEvent(eventId);
      if (success) {
        toast({
          title: "Event Announced",
          description: "Your event has been announced successfully",
        });
      } else {
        toast({
          title: "Announcement Failed",
          description: "Failed to announce the event. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error announcing event:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setAnnouncingEventId(null);
    }
  };
  
  const activeEvents = events.filter(event => event.enabled !== false);
  const closedEvents = events.filter(event => event.enabled === false);
  
  const eventMatchesSearch = (event: Event, query: string) => {
    if (!query.trim()) return true;
    
    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    
    const fieldsToSearch = [
      event.title || '',
      event.description || '',
      event.location || '',
      event.website || '',
      event.contact || ''
    ];
    
    return searchTerms.every(term => 
      fieldsToSearch.some(field => field.toLowerCase().includes(term))
    );
  };
  
  const applyFilters = (event: Event) => {
    if (!eventMatchesSearch(event, searchQuery)) return false;
    
    if (hiddenEventIds.includes(event.id) && !showHiddenEvents) return false;
    
    if (filter === "all") return true;
    if (filter === "all-but-announced") return !(event.announced || false);
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
  };
  
  const filteredActiveEvents = activeEvents.filter(applyFilters);
  const filteredClosedEvents = closedEvents.filter(applyFilters);

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

  const isAnnouncedEvent = (event: Event) => {
    return event.announced || false;
  };

  const renderEventCard = (event: Event) => {
    const announced = isAnnouncedEvent(event);
    const isHidden = hiddenEventIds.includes(event.id);
    const canAnnounce = event.isCreator && !announced && onAnnounceEvent;
    
    return (
      <Card 
        key={event.id} 
        className={`overflow-hidden transition-all duration-300 hover:shadow-xl border-gray-200 dark:border-gray-700 card-hover flex flex-col h-full ${
          announced ? "border-l-4 border-l-cyan-500 dark:border-l-cyan-600" : ""
        } ${isHidden && showHiddenEvents ? "opacity-60" : ""}`}
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
                {isHidden && (
                  <Badge variant="outline" className="ml-2 border-gray-500 text-gray-700 dark:border-gray-600 dark:text-gray-300">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hidden
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
                <span>Created by: {event.externalWallet || formatWalletAddress(event.ownerAddress)}</span>
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
              {getTalkCount(event)} {getTalkCount(event) === 1 ? 'talk' : 'talks'} submitted
            </p>
          </div>
          <div className="mt-auto pt-2 space-y-2">
            <div className="flex justify-between items-center">
              <Link to={`/event/${event.id}`} className="flex-grow">
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
              <div className="flex ml-2">
                {canAnnounce && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="mr-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-700 dark:text-cyan-300 dark:hover:bg-cyan-900/30"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAnnounceEvent(event.id);
                          }}
                          disabled={announcingEventId === event.id}
                        >
                          {announcingEventId === event.id ? (
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <Megaphone className="h-5 w-5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Announce this event
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleHideEvent(event.id);
                        }}
                      >
                        {isHidden ? (
                          <Eye className="h-5 w-5" />
                        ) : (
                          <EyeOff className="h-5 w-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isHidden ? "Show event" : "Hide event"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getTalkCount = (event: Event): number => {
    if (event.talks && event.talks.length > 0) {
      return event.talks.length;
    }
    
    if (typeof event.questionsCount === 'number') {
      return event.questionsCount;
    }
    
    return 0;
  };

  const hiddenEventsCount = events.filter(event => hiddenEventIds.includes(event.id)).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Events</h2>
          {connected && (
            <Link to="/my-talks">
              <Button 
                variant="outline" 
                className="ml-1"
              >
                <PresentationIcon className="mr-2 h-5 w-5" />
                My Talks
              </Button>
            </Link>
          )}
        </div>
        
        <div className="relative w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input 
              type="text"
              placeholder="Search events by title, description, location..."
              className="pl-10 pr-4 py-2 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
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
            variant={filter === "all-but-announced" ? "default" : "outline"}
            onClick={() => setFilter("all-but-announced")}
            className={filter === "all-but-announced" ? "bg-accent hover:bg-accent/90" : ""}
            aria-pressed={filter === "all-but-announced"}
          >
            <BellOff className="mr-1 h-4 w-4" />
            All But Announced
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

          {hiddenEventIds.length > 0 && (
            <Button 
              variant={showHiddenEvents ? "default" : "outline"}
              onClick={() => setShowHiddenEvents(prev => !prev)}
              className={`ml-auto ${showHiddenEvents ? "bg-gray-600 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {showHiddenEvents ? (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Showing Hidden ({hiddenEventsCount})
                </>
              ) : (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hidden Events ({hiddenEventsCount})
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {filteredActiveEvents.length === 0 && filteredClosedEvents.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            {searchQuery ? (
              <p className="text-lg text-gray-500 dark:text-gray-400">
                No events found matching your search. Try different keywords or clear the search.
              </p>
            ) : !connected && (filter === "created" || filter === "submitted" || filter === "voted") ? (
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
          {searchQuery && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Found {filteredActiveEvents.length + filteredClosedEvents.length} events matching "{searchQuery}"
            </div>
          )}
        
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
