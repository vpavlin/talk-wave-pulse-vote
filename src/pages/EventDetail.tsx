import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  ArrowLeft, 
  Calendar, 
  MessageSquarePlus, 
  Shuffle, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  Wallet
} from "lucide-react";
import SubmitTalkDialog from "@/components/SubmitTalkDialog";
import TalkCard from "@/components/TalkCard";
import { format, parseISO } from "date-fns";
import { useWallet } from "@/contexts/WalletContext";
import ThemeToggle from "@/components/ThemeToggle";
import { fetchEventById, createTalk, upvoteTalk } from "@/services/eventService";

const EventDetail = () => {
  const { eventId = "" } = useParams();
  const [sortOption, setSortOption] = useState("votes");
  const [isSubmitTalkOpen, setIsSubmitTalkOpen] = useState(false);
  const { toast } = useToast();
  const { connected, connect } = useWallet();
  const queryClient = useQueryClient();
  
  const { data: event, refetch, isLoading, isError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEventById(eventId),
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
    enabled: !!eventId,
  });

  const handleSubmitTalk = async (talkData: { title: string; speaker: string; description: string }) => {
    if (!event) return;
    
    try {
      const talkId = await createTalk(
        event.id, 
        talkData.title, 
        talkData.description, 
        talkData.speaker
      );
      
      if (talkId) {
        toast({
          title: "Talk Submitted",
          description: "Your lightning talk has been submitted successfully",
        });
        
        setIsSubmitTalkOpen(false);
        
        queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit talk",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (talkId: string) => {
    if (!event) return;
    
    if (!connected) {
      connect();
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to vote",
      });
      return;
    }
    
    try {
      const success = await upvoteTalk(event.id, talkId);
      if (success) {
        toast({
          title: "Vote Recorded",
          description: "Your vote has been counted",
        });
        
        queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      } else {
        toast({
          title: "Error",
          description: "Failed to record vote",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const getSortedTalks = () => {
    if (!event) return [];
    
    const sortedTalks = [...event.talks];
    
    switch (sortOption) {
      case "votes":
        return sortedTalks.sort((a, b) => b.votes - a.votes);
      case "time":
        return sortedTalks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "random":
        return sortedTalks.sort(() => Math.random() - 0.5);
      default:
        return sortedTalks;
    }
  };

  const formatWalletAddress = (address: string | undefined) => {
    if (!address) return "Unknown";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950">
        <div className="text-center">
          <div className="animate-pulse mx-auto h-12 w-12 rounded-full bg-accent mb-4"></div>
          <p className="text-xl font-medium text-gray-600 dark:text-gray-300">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-6 w-6 text-destructive" />
              Error Loading Event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">We couldn't load the event details. The event may have been removed or you may not have access.</p>
            <Link to="/">
              <Button variant="default" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 to-indigo-950 transition-colors">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link to="/">
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg text-gray-700 dark:text-gray-300 focus-ring"
              aria-label="Back to events list"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Events
            </Button>
          </Link>
          <ThemeToggle />
        </div>
        
        <Card className="mb-8 border-purple-100 dark:border-purple-900 bg-white/90 dark:bg-gray-800/90 backdrop-blur glass-card">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-3xl md:text-4xl font-bold text-purple-800 dark:text-purple-300 mb-2">
                  {event.title}
                </CardTitle>
                <CardDescription className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  {event.description}
                </CardDescription>
                {event.ownerAddress && (
                  <div className="mt-2 flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <Wallet className="h-4 w-4 mr-1" />
                    <span>Created by: {formatWalletAddress(event.ownerAddress)}</span>
                  </div>
                )}
              </div>
              <Badge className="date-badge text-lg">
                <Calendar className="h-5 w-5" />
                {event.eventDate ? format(new Date(event.eventDate), "MMMM d, yyyy") : "Date TBD"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setIsSubmitTalkOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700 text-lg px-6 py-6 h-auto focus-ring"
              disabled={!connected}
              size="lg"
              aria-label="Submit a lightning talk"
            >
              <MessageSquarePlus className="mr-2 h-6 w-6" />
              Submit a Lightning Talk
            </Button>
            {!connected && (
              <p className="mt-2 text-amber-600 dark:text-amber-400 text-sm flex items-center">
                <AlertCircle className="inline-block mr-1 h-4 w-4" />
                Connect your wallet to submit a talk
              </p>
            )}
          </CardContent>
        </Card>
        
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
            Submitted Talks 
            <span className="ml-2 text-lg font-normal text-gray-500 dark:text-gray-400">
              ({event.talks.length || 0})
            </span>
          </h2>
          
          <ToggleGroup 
            type="single" 
            value={sortOption} 
            onValueChange={(value) => value && setSortOption(value)}
            aria-label="Sort talks by"
          >
            <ToggleGroupItem 
              value="votes" 
              aria-label="Sort by votes" 
              className="text-base flex items-center gap-1 data-[state=on]:bg-purple-100 data-[state=on]:text-purple-700 dark:data-[state=on]:bg-purple-900/70 dark:data-[state=on]:text-purple-200 focus-ring"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="hidden sm:inline">Votes</span>
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="time" 
              aria-label="Sort by time" 
              className="text-base flex items-center gap-1 data-[state=on]:bg-purple-100 data-[state=on]:text-purple-700 dark:data-[state=on]:bg-purple-900/70 dark:data-[state=on]:text-purple-200 focus-ring"
            >
              <Clock className="h-5 w-5" />
              <span className="hidden sm:inline">Recent</span>
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="random" 
              aria-label="Sort randomly" 
              className="text-base flex items-center gap-1 data-[state=on]:bg-purple-100 data-[state=on]:text-purple-700 dark:data-[state=on]:bg-purple-900/70 dark:data-[state=on]:text-purple-200 focus-ring"
            >
              <Shuffle className="h-5 w-5" />
              <span className="hidden sm:inline">Random</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="bg-purple-100/70 dark:bg-purple-900/40 p-1">
            <TabsTrigger 
              value="all" 
              className="text-lg data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800 dark:data-[state=active]:bg-purple-800 dark:data-[state=active]:text-purple-100 focus-ring"
            >
              All Talks
            </TabsTrigger>
            <TabsTrigger 
              value="top" 
              className="text-lg data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800 dark:data-[state=active]:bg-purple-800 dark:data-[state=active]:text-purple-100 focus-ring"
            >
              Top Rated
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getSortedTalks().map(talk => (
                <TalkCard 
                  key={talk.id} 
                  talk={talk} 
                  onVote={() => handleVote(talk.id)} 
                />
              ))}
              {getSortedTalks().length === 0 && (
                <p className="text-lg text-gray-500 dark:text-gray-400 col-span-2 text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  No talks have been submitted yet. Be the first to submit a talk!
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="top" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getSortedTalks()
                .filter(talk => talk.votes >= 10)
                .map(talk => (
                  <TalkCard 
                    key={talk.id} 
                    talk={talk} 
                    onVote={() => handleVote(talk.id)} 
                  />
                ))
              }
              {getSortedTalks().filter(talk => talk.votes >= 10).length === 0 && (
                <p className="text-lg text-gray-500 dark:text-gray-400 col-span-2 text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  No talks have received 10 or more votes yet.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <SubmitTalkDialog 
        open={isSubmitTalkOpen}
        onOpenChange={setIsSubmitTalkOpen}
        onSubmit={handleSubmitTalk}
      />
    </div>
  );
};

export default EventDetail;
