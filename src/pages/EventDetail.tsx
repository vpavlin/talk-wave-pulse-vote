import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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

interface Talk {
  id: string;
  title: string;
  speaker: string;
  description: string;
  votes: number;
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  talks: Talk[];
}

const EventDetail = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [sortOption, setSortOption] = useState("votes");
  const [isSubmitTalkOpen, setIsSubmitTalkOpen] = useState(false);
  const { toast } = useToast();
  const { connected, connect } = useWallet();
  
  useEffect(() => {
    const demoEvent = {
      id: eventId,
      title: "React Conference 2025",
      description: "The premier React event of the year",
      date: "2025-06-15",
      talks: [
        {
          id: "talk1",
          title: "React Server Components Deep Dive",
          speaker: "Jane Doe",
          description: "Exploring the future of React with server components",
          votes: 24,
          createdAt: new Date(2024, 2, 15).toISOString(),
        },
        {
          id: "talk2",
          title: "Building UI with the Latest React Patterns",
          speaker: "John Smith",
          description: "Learn about the newest React patterns for efficient UI development",
          votes: 18,
          createdAt: new Date(2024, 3, 1).toISOString(),
        },
        {
          id: "talk3",
          title: "Performance Optimization in React Applications",
          speaker: "Alex Johnson",
          description: "Techniques to make your React apps blazing fast",
          votes: 32,
          createdAt: new Date(2024, 2, 20).toISOString(),
        }
      ]
    };
    
    setEvent(demoEvent);
  }, [eventId]);

  const handleSubmitTalk = (talkData: Omit<Talk, 'id' | 'votes' | 'createdAt'>) => {
    if (!event) return;
    
    const newTalk = {
      id: `talk-${Date.now()}`,
      ...talkData,
      votes: 0,
      createdAt: new Date().toISOString(),
    };
    
    setEvent({
      ...event,
      talks: [...event.talks, newTalk]
    });
    
    toast({
      title: "Talk Submitted",
      description: "Your lightning talk has been submitted successfully",
    });
    
    setIsSubmitTalkOpen(false);
  };

  const handleVote = (talkId: string) => {
    if (!event) return;
    
    if (!connected) {
      connect();
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to vote",
      });
      return;
    }
    
    setEvent({
      ...event,
      talks: event.talks.map(talk => {
        if (talk.id === talkId) {
          return { ...talk, votes: talk.votes + 1 };
        }
        return talk;
      })
    });
    
    toast({
      title: "Vote Recorded",
      description: "Your vote has been counted",
    });
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
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading event details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
        
        <Card className="mb-8 border-purple-100 bg-white/80 backdrop-blur">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {event?.title}
                </CardTitle>
                <CardDescription className="mt-1 text-base">
                  {event?.description}
                </CardDescription>
              </div>
              <Badge className="flex items-center gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200">
                <Calendar className="h-3 w-3" />
                {event?.date ? format(new Date(event.date), "MMMM d, yyyy") : ""}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setIsSubmitTalkOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              disabled={!connected}
            >
              <MessageSquarePlus className="mr-2 h-5 w-5" />
              Submit a Lightning Talk
            </Button>
          </CardContent>
        </Card>
        
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Submitted Talks 
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({event?.talks.length || 0})
            </span>
          </h2>
          
          <ToggleGroup type="single" value={sortOption} onValueChange={(value) => value && setSortOption(value)}>
            <ToggleGroupItem value="votes" aria-label="Sort by votes" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Votes</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="time" aria-label="Sort by time" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Recent</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="random" aria-label="Sort randomly" className="flex items-center gap-1">
              <Shuffle className="h-4 w-4" />
              <span className="hidden sm:inline">Random</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="bg-purple-100/50">
            <TabsTrigger value="all">All Talks</TabsTrigger>
            <TabsTrigger value="top">Top Rated</TabsTrigger>
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
                <p className="text-gray-500 col-span-2 text-center py-8">
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
