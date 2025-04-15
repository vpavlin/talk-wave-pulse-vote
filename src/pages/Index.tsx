import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import EventList from "@/components/EventList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import CreateEventDialog from "@/components/CreateEventDialog";
import WalletConnectButton from "@/components/WalletConnectButton";
import ThemeToggle from "@/components/ThemeToggle";
import { useWallet } from "@/contexts/WalletContext";
import { fetchEvents, createEvent, useEventAnnouncements } from "@/services/eventService";

const Index = () => {
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const { toast } = useToast();
  const { connected, walletAddress } = useWallet();
  const queryClient = useQueryClient();
  
  // Set up event announcement listener
  useEventAnnouncements();
  
  // Refresh events data when identity state changes
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
  }, [walletAddress, connected, queryClient]);
  
  // Use React Query for data fetching with improved polling for real-time updates
  const { data: events = [], isLoading, isError } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Refresh data every 10 seconds
  });

  const handleCreateEvent = async (eventData: { 
    title: string; 
    description: string; 
    date: string;
    website?: string;
    location?: string;
    contact?: string;
    bannerImage?: string;
  }) => {
    try {
      const eventId = await createEvent(
        eventData.title, 
        eventData.description, 
        eventData.date,
        eventData.location,
        eventData.website,
        eventData.contact,
        eventData.bannerImage
      );
      
      if (eventId) {
        toast({
          title: "Event Created",
          description: `${eventData.title} has been created successfully`,
        });
        setIsCreateEventOpen(false);
        
        // Invalidate and refetch events to update the list
        queryClient.invalidateQueries({ queryKey: ['events'] });
      } else {
        toast({
          title: "Error",
          description: "Failed to create event",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 to-indigo-950 transition-colors">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        
        <div className="mb-12 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Lightning Talk Wave
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Submit and vote on lightning talks for upcoming tech conferences and events.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg"
              className="text-lg px-6 py-6 h-auto"
              onClick={() => setIsCreateEventOpen(true)}
              disabled={!connected}
              aria-label="Create a new event"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Event
            </Button>
            
            <WalletConnectButton />
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse mx-auto h-12 w-12 rounded-full bg-accent mb-4"></div>
            <p className="text-xl font-medium text-gray-600 dark:text-gray-300">Loading events...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xl font-medium text-red-600 dark:text-red-400">
              Failed to load events. Please try again later.
            </p>
          </div>
        ) : (
          <EventList events={events} />
        )}
      </div>
      
      <CreateEventDialog 
        open={isCreateEventOpen} 
        onOpenChange={setIsCreateEventOpen}
        onSubmit={handleCreateEvent}
      />
    </div>
  );
};

export default Index;
