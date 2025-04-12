
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowLeft, Calendar, MessageSquarePlus, Shuffle, Clock, TrendingUp } from "lucide-react";
import SubmitTalkDialog from "@/components/SubmitTalkDialog";
import TalkCard from "@/components/TalkCard";
import { format } from "date-fns";
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
  
  // Fetch event data with improved polling for real-time updates
  const { data: event, refetch, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEventById(eventId),
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Refresh data every 5 seconds for real-time updates
    enabled: !!eventId, // Only run the query if we have an eventId
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
        
        // Invalidate and refetch event to update the talks list
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
        
        // Invalidate and refetch event to update the vote count
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

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-gray-600 dark:text-gray-300">
        <p>Loading event details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950 transition-colors">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <Link to="/">
            <Button variant="ghost" className="text-gray-700 dark:text-gray-300">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </Link>
          <ThemeToggle />
        </div>
        
        <Card className="mb-8 border-purple-100 dark:border-purple-900 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  {event?.title}
                </CardTitle>
                <CardDescription className="mt-1 text-base dark:text-gray-300">
                  {event?.description}
                </CardDescription>
              </div>
              <Badge className="flex items-center gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-900">
                <Calendar className="h-3 w-3" />
                {event?.date ? format(new Date(event.date), "MMMM d, yyyy") : ""}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setIsSubmitTalkOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-700 dark:to-indigo-700 dark:hover:from-purple-800 dark:hover:to-indigo-800"
              disabled={!connected}
            >
              <MessageSquarePlus className="mr-2 h-5 w-5" />
              Submit a Lightning Talk
            </Button>
          </CardContent>
        </Card>
        
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Submitted Talks 
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({event?.talks.length || 0})
            </span>
          </h2>
          
          <ToggleGroup type="single" value={sortOption} onValueChange={(value) => value && setSortOption(value)}>
            <ToggleGroupItem value="votes" aria-label="Sort by votes" className="flex items-center gap-1 data-[state=on]:bg-purple-100 data-[state=on]:text-purple-700 dark:data-[state=on]:bg-purple-900/50 dark:data-[state=on]:text-purple-300">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Votes</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="time" aria-label="Sort by time" className="flex items-center gap-1 data-[state=on]:bg-purple-100 data-[state=on]:text-purple-700 dark:data-[state=on]:bg-purple-900/50 dark:data-[state=on]:text-purple-300">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Recent</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="random" aria-label="Sort randomly" className="flex items-center gap-1 data-[state=on]:bg-purple-100 data-[state=on]:text-purple-700 dark:data-[state=on]:bg-purple-900/50 dark:data-[state=on]:text-purple-300">
              <Shuffle className="h-4 w-4" />
              <span className="hidden sm:inline">Random</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="bg-purple-100/50 dark:bg-purple-900/30">
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800 dark:data-[state=active]:bg-purple-800 dark:data-[state=active]:text-purple-100">All Talks</TabsTrigger>
            <TabsTrigger value="top" className="data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800 dark:data-[state=active]:bg-purple-800 dark:data-[state=active]:text-purple-100">Top Rated</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getSortedTalks().map(talk => (
                <TalkCard 
                  key={talk.id} 
                  talk={talk} 
                  onVote={() => handleVote(talk.id)} 
                />
              ))}
              {getSortedTalks().length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 col-span-2 text-center py-8">
                  No talks have been submitted yet. Be the first to submit a talk!
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="top" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getSortedTalks()
                .filter(talk => talk.votes >= 10) // Only show talks with 10+ votes
                .map(talk => (
                  <TalkCard 
                    key={talk.id} 
                    talk={talk} 
                    onVote={() => handleVote(talk.id)} 
                  />
                ))
              }
              {getSortedTalks().filter(talk => talk.votes >= 10).length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 col-span-2 text-center py-8">
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
