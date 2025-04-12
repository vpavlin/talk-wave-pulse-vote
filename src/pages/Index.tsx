
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import EventList from "@/components/EventList";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, AlertCircle } from "lucide-react";
import CreateEventDialog from "@/components/CreateEventDialog";
import WalletConnectButton from "@/components/WalletConnectButton";
import ThemeToggle from "@/components/ThemeToggle";
import { useWallet } from "@/contexts/WalletContext";
import { fetchEvents, createEvent } from "@/services/eventService";

const Index = () => {
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const { toast } = useToast();
  const { connected } = useWallet();
  const queryClient = useQueryClient();
  
  // Use React Query for data fetching with improved polling for real-time updates
  const { data: events = [], isLoading, isError } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Refresh data every 10 seconds
  });

  const handleCreateEvent = async (eventData: { title: string; description: string; date: string }) => {
    try {
      const eventId = await createEvent(eventData.title, eventData.description, eventData.date);
      
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
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950 transition-colors">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        
        <div className="mb-12 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Lightning Talk Wave
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
            Submit and vote on lightning talks for upcoming tech conferences and events.
            Connect your web3 wallet to get started.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700 text-lg px-6 py-6 h-auto focus-ring button-hover"
              onClick={() => setIsCreateEventOpen(true)}
              disabled={!connected}
              size="lg"
              aria-label="Create a new event"
            >
              <PlusCircle className="mr-2 h-6 w-6" />
              Create Event
            </Button>
            
            <WalletConnectButton />
          </div>
          
          {!connected && (
            <p className="mt-4 text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
              <AlertCircle className="h-5 w-5" />
              Connect your wallet to create events or submit talks
            </p>
          )}
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse mx-auto h-12 w-12 rounded-full bg-accent mb-4"></div>
            <p className="text-xl font-medium text-gray-600 dark:text-gray-300">Loading events...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
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
