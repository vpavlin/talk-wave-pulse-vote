
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "@/services/eventService";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PresentationIcon, ThumbsUp, MessageSquare, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const MyTalks = () => {
  const { walletAddress, connected, connect } = useWallet();
  const { toast } = useToast();

  // Fetch all events (we'll filter for the user's talks from these)
  const { data: events, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  // Connect wallet if not connected
  const handleConnectWallet = async () => {
    try {
      await connect();
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to wallet",
        variant: "destructive",
      });
    }
  };

  // Extract all talks submitted by the current user
  const myTalks = React.useMemo(() => {
    if (!events || !connected || !walletAddress) return [];

    const userTalks = [];
    
    for (const event of events) {
      // Filter talks where the wallet address matches or isAuthor is true
      const filteredTalks = event.talks.filter(talk => 
        talk.isAuthor === true || 
        (talk.walletAddress && walletAddress && talk.walletAddress === walletAddress)
      );
      
      if (filteredTalks.length > 0) {
        filteredTalks.forEach(talk => {
          userTalks.push({
            ...talk,
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.eventDate || format(new Date(event.date), "MMM d, yyyy")
          });
        });
      }
    }
    
    console.log("Found user talks:", userTalks.length, "User wallet:", walletAddress);
    // Log the first few talks for debugging
    if (userTalks.length > 0) {
      userTalks.slice(0, 3).forEach((talk, i) => {
        console.log(`Talk ${i+1}:`, {
          title: talk.title,
          isAuthor: talk.isAuthor,
          walletAddress: talk.walletAddress
        });
      });
    }
    
    return userTalks;
  }, [events, connected, walletAddress]);

  // Calculate statistics
  const totalSubmissions = myTalks.length;
  const totalVotes = myTalks.reduce((sum, talk) => sum + talk.votes, 0);
  const eventsParticipated = new Set(myTalks.map(talk => talk.eventId)).size;

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center text-center space-y-6 my-12">
          <PresentationIcon className="h-24 w-24 text-purple-400 opacity-80" />
          <h1 className="text-3xl font-bold text-white">My Talks</h1>
          <p className="text-xl text-gray-300 max-w-md">
            Connect your wallet to see talks you've submitted to various events.
          </p>
          <Button 
            onClick={handleConnectWallet} 
            className="mt-4 bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">My Talks</h1>
        <div className="text-center py-10">
          <div className="animate-pulse text-purple-300">Loading your talks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">My Talks</h1>
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-200">
          <p>Failed to load your talks. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">My Talks</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-200">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white flex items-center">
              <PresentationIcon className="mr-3 h-8 w-8 text-purple-400" />
              {totalSubmissions}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-200">Total Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white flex items-center">
              <ThumbsUp className="mr-3 h-8 w-8 text-purple-400" />
              {totalVotes}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-200">Events Participated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white flex items-center">
              <Calendar className="mr-3 h-8 w-8 text-purple-400" />
              {eventsParticipated}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Talk list */}
      {myTalks.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="text-center py-12">
            <MessageSquare className="h-16 w-16 mx-auto text-gray-500 mb-4" />
            <p className="text-xl text-gray-300">You haven't submitted any talks yet.</p>
            <p className="text-gray-400 mt-2">
              Find an interesting event and share your knowledge with the community!
            </p>
            <Link to="/">
              <Button className="mt-6 bg-purple-600 hover:bg-purple-700">
                Browse Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Submitted Talks</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-purple-200">Talk Title</TableHead>
                  <TableHead className="text-purple-200">Event</TableHead>
                  <TableHead className="text-purple-200">Date</TableHead>
                  <TableHead className="text-purple-200 text-center">Votes</TableHead>
                  <TableHead className="text-purple-200 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myTalks.map(talk => (
                  <TableRow key={talk.id} className="border-gray-700 hover:bg-gray-700/30">
                    <TableCell className="font-medium text-white">{talk.title}</TableCell>
                    <TableCell className="text-gray-300">{talk.eventTitle}</TableCell>
                    <TableCell className="text-gray-300">{talk.eventDate}</TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-purple-800/60 hover:bg-purple-800 text-white">
                        {talk.votes} votes
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/event/${talk.eventId}`}>
                        <Button variant="outline" size="sm" className="border-purple-600 text-purple-300 hover:bg-purple-900/30">
                          View Event <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyTalks;
