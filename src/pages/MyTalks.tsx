import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "@/services/eventService";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { getUserInfo } from "@/services/aiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PresentationIcon, ThumbsUp, MessageSquare, Calendar, ArrowRight, ArrowLeft, BrainCircuit, Lock, Unlock } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import AiTalkSuggestion from "@/components/AiTalkSuggestion";
import SubmitTalkDialog from "@/components/SubmitTalkDialog";
import UserProfileCard from "@/components/UserProfileCard";

const MyTalks = () => {
  const { walletAddress, connected, connect } = useWallet();
  const { toast } = useToast();
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [talkData, setTalkData] = useState({ title: "", speaker: "", description: "", bio: "" });

  // Fetch all events (we'll filter for the user's talks from these)
  const { data: events, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  // Auto-connect on component mount if not already connected
  useEffect(() => {
    if (!connected) {
      connect();
    }
  }, [connected, connect]);

  // Get user info when component mounts
  useEffect(() => {
    const userInfo = getUserInfo();
    setTalkData(prevData => ({
      ...prevData,
      speaker: userInfo.name,
      bio: userInfo.bio
    }));
  }, []);

  // Extract all talks submitted by the current user
  const myTalks = React.useMemo(() => {
    if (!events || !walletAddress) {
      console.log("No events or wallet address yet");
      return [];
    }

    const userTalks = [];
    
    console.log("Wallet address:", walletAddress);
    console.log("Total events:", events.length);
    
    for (const event of events) {
      // Make sure talks array exists
      if (!event.talks || !Array.isArray(event.talks)) {
        console.log("Event has no talks array:", event.id);
        continue;
      }
      
      console.log(`Event ${event.id} has ${event.talks.length} talks`);
      
      // Filter talks where the wallet address matches or isAuthor is true
      const filteredTalks = event.talks.filter(talk => {
        // Check for author flag
        if (talk.isAuthor === true) {
          console.log("Found user talk by isAuthor flag:", talk.title);
          return true;
        }
        
        // Check wallet addresses - case insensitive comparison
        if (talk.walletAddress && walletAddress && 
            talk.walletAddress.toLowerCase() === walletAddress.toLowerCase()) {
          console.log("Found user talk by wallet match:", talk.title);
          return true;
        }
        
        // Additional debug for each talk we're checking
        console.log("Talk not matching:", talk.title, 
                   "isAuthor:", talk.isAuthor, 
                   "Talk wallet:", talk.walletAddress);
        
        return false;
      });
      
      if (filteredTalks.length > 0) {
        console.log(`Found ${filteredTalks.length} user talks in event ${event.id}`);
        filteredTalks.forEach(talk => {
          userTalks.push({
            ...talk,
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.eventDate || format(new Date(event.date), "MMM d, yyyy"),
            eventEnabled: event.enabled
          });
        });
      }
    }
    
    console.log("Total found user talks:", userTalks.length, "User wallet:", walletAddress);
    // Log the first few talks for debugging
    if (userTalks.length > 0) {
      userTalks.slice(0, 3).forEach((talk, i) => {
        console.log(`Talk ${i+1}:`, {
          title: talk.title,
          isAuthor: talk.isAuthor,
          walletAddress: talk.walletAddress,
          eventEnabled: talk.eventEnabled
        });
      });
    }
    
    return userTalks;
  }, [events, walletAddress]);

  // Calculate statistics
  const totalSubmissions = myTalks.length;
  const totalVotes = myTalks.reduce((sum, talk) => sum + talk.votes, 0);
  const eventsParticipated = new Set(myTalks.map(talk => talk.eventId)).size;

  // Handle the submission of a talk using AI suggestion
  const handleSubmitTalk = async (talkData) => {
    // This is just a stub - in a real app you would submit to a specific event
    toast({
      title: "Talk Created",
      description: "Your talk has been saved as a draft. Select an event to submit it.",
    });
    setSubmitDialogOpen(false);
  };

  // Handle using an AI suggestion
  const handleUseSuggestion = (suggestion) => {
    const userInfo = getUserInfo();
    setTalkData({
      title: suggestion.title,
      speaker: userInfo.name,
      description: suggestion.description,
      bio: userInfo.bio
    });
    setSubmitDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">My Talks</h1>
        </div>
        <div className="text-center py-10">
          <div className="animate-pulse text-purple-300">Loading your talks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">My Talks</h1>
        </div>
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-200">
          <p>Failed to load your talks. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link to="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white">My Talks</h1>
      </div>
      
      {/* User Profile Card */}
      <UserProfileCard />
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-200">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white flex items-center">
              <PresentationIcon className="mr-3 h-8 w-8 text-purple-400" />
              {myTalks.length}
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
              {myTalks.reduce((sum, talk) => sum + talk.votes, 0)}
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
              {new Set(myTalks.map(talk => talk.eventId)).size}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* AI Talk Suggestion */}
      <div className="mb-8">
        <AiTalkSuggestion 
          talks={myTalks} 
          onUseSuggestion={handleUseSuggestion}
        />
      </div>
      
      {/* Talk list */}
      {myTalks.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="text-center py-12">
            <MessageSquare className="h-16 w-16 mx-auto text-gray-500 mb-4" />
            <p className="text-xl text-gray-300">You don't have any submitted talks yet.</p>
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
                  <TableHead className="text-purple-200 text-center">Status</TableHead>
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
                      {talk.eventEnabled !== false ? (
                        <Badge className="bg-green-800/60 hover:bg-green-800 text-white flex items-center justify-center w-20 mx-auto">
                          <Unlock className="h-3 w-3 mr-1" /> Open
                        </Badge>
                      ) : (
                        <Badge className="bg-red-800/60 hover:bg-red-800 text-white flex items-center justify-center w-20 mx-auto">
                          <Lock className="h-3 w-3 mr-1" /> Closed
                        </Badge>
                      )}
                    </TableCell>
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
      
      {/* Talk submission dialog that can be triggered by AI suggestions */}
      <SubmitTalkDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        onSubmit={handleSubmitTalk}
        initialData={talkData}
      />
    </div>
  );
};

export default MyTalks;
