
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import EventList from "@/components/EventList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import CreateEventDialog from "@/components/CreateEventDialog";
import WalletConnectButton from "@/components/WalletConnectButton";
import ThemeToggle from "@/components/ThemeToggle";
import { useWallet } from "@/contexts/WalletContext";
import { fetchEvents, createEvent, Event } from "@/services/eventService";

const Index = () => {
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const { toast } = useToast();
  const { connected } = useWallet();
  
  // Use React Query for data fetching
  const { data: events = [], refetch } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    refetchOnWindowFocus: false,
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
        
        // Refetch events to update the list
        setTimeout(() => refetch(), 1000);
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
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
            Lightning Talk Wave
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Submit and vote on lightning talks for upcoming tech conferences and events.
            Connect your web3 wallet to get started.
          </p>
          
          <div className="mt-6 flex justify-center gap-4">
            <Button 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-700 dark:to-indigo-700 dark:hover:from-purple-800 dark:hover:to-indigo-800"
              onClick={() => setIsCreateEventOpen(true)}
              disabled={!connected}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Event
            </Button>
            
            <WalletConnectButton />
          </div>
        </div>
        
        <EventList events={events} />
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
