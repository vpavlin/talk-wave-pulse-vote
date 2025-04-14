import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ReactMarkdown from "react-markdown";
import { 
  ArrowLeft, 
  Calendar, 
  MessageSquarePlus, 
  Shuffle, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  Wallet,
  Link as LinkIcon,
  MapPin,
  Phone,
  Share,
  Twitter,
  Copy,
  CheckCircle,
  Hash
} from "lucide-react";
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
  const [copied, setCopied] = useState(false);
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

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        toast({
          title: "Link Copied",
          description: "Event link has been copied to clipboard",
        });
        
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Could not copy the link to clipboard",
          variant: "destructive",
        });
      });
  };

  const handleShareTwitter = () => {
    if (!event) return;
    
    const title = encodeURIComponent(`Check out "${event.title}" on Lightning Talk Wave`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, '_blank');
  };

  const handleShareFarcaster = () => {
    if (!event) return;
    
    const title = encodeURIComponent(`Check out "${event.title}" on Lightning Talk Wave`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://warpcast.com/~/compose?text=${title}&embeds[]=${url}`, '_blank');
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

  const eventBanner = event.bannerImage ? (
    <div className="w-full h-48 md:h-64 mb-6 rounded-lg overflow-hidden">
      <img 
        src={event.bannerImage} 
        alt={`${event.title} banner`} 
        className="w-full h-full object-cover"
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
    </div>
  ) : null;

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
          <div className="flex space-x-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="bg-purple-800/30 border-purple-700/50 hover:bg-purple-700/50 text-purple-100 focus-ring"
                aria-label="Copy event link"
              >
                {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleShareTwitter}
                className="bg-blue-600/30 border-blue-500/50 hover:bg-blue-600/50 text-blue-100 focus-ring"
                aria-label="Share on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleShareFarcaster}
                className="bg-violet-600/30 border-violet-500/50 hover:bg-violet-600/50 text-violet-100 focus-ring"
                aria-label="Share on Farcaster"
              >
                <Hash className="h-5 w-5" />
              </Button>
            </div>
            <ThemeToggle />
          </div>
        </div>
        
        {eventBanner}
        
        <Card className="mb-8 border-purple-100 dark:border-purple-900 bg-white/90 dark:bg-gray-800/90 backdrop-blur glass-card">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-3xl md:text-4xl font-bold text-purple-800 dark:text-purple-300 mb-2">
                  {event.title}
                </CardTitle>
                <div className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert prose-p:my-2 max-w-none">
                  <ReactMarkdown>{event.description}</ReactMarkdown>
                </div>
                
                <div className="mt-4 space-y-2">
                  {event.ownerAddress && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <Wallet className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Created by: {formatWalletAddress(event.ownerAddress)}</span>
                    </div>
                  )}
                  
                  {event.location && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  
                  {event.website && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <a 
                        href={event.website.startsWith('http') ? event.website : `https://${event.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        {event.website}
                      </a>
                    </div>
                  )}
                  
                  {event.contact && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      {event.contact.includes('@') ? (
                        <a 
                          href={`mailto:${event.contact}`} 
                          className="text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          {event.contact}
                        </a>
                      ) : event.contact.match(/^\+?[\d\s-()]{7,}$/) ? (
                        <a 
                          href={`tel:${event.contact.replace(/\s+/g, '')}`} 
                          className="text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          {event.contact}
                        </a>
                      ) : (
                        <span>{event.contact}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <Badge className="date-badge text-lg self-start">
                <Calendar className="h-5 w-5 mr-1" />
                {event.eventDate ? format(new Date(event.eventDate), "MMMM d, yyyy") : "Date TBD"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
              
              <Button 
                variant="outline" 
                className="text-lg px-6 py-6 h-auto border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 focus-ring"
                onClick={() => {
                  const shareData = {
                    title: event.title,
                    text: `Check out "${event.title}" on Lightning Talk Wave`,
                    url: window.location.href
                  };
                  
                  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                    navigator.share(shareData).catch(() => {
                      handleCopyLink();
                    });
                  } else {
                    handleCopyLink();
                  }
                }}
                aria-label="Share event"
              >
                <Share className="mr-2 h-6 w-6" />
                Share Event
              </Button>
            </div>
            
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
