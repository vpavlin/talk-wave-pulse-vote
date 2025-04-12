
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import EventList from "@/components/EventList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import CreateEventDialog from "@/components/CreateEventDialog";
import WalletConnectButton from "@/components/WalletConnectButton";
import { useWallet } from "@/contexts/WalletContext";

const Index = () => {
  const [events, setEvents] = useState([]);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const { toast } = useToast();
  const { connected } = useWallet();
  
  useEffect(() => {
    // Simulate loading events
    const demoEvents = [
      {
        id: "1",
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
          },
          {
            id: "talk2",
            title: "Building UI with the Latest React Patterns",
            speaker: "John Smith",
            description: "Learn about the newest React patterns for efficient UI development",
            votes: 18,
          }
        ]
      },
      {
        id: "2",
        title: "TypeScript Summit",
        description: "Everything TypeScript for developers",
        date: "2025-07-22",
        talks: [
          {
            id: "talk3",
            title: "Type-Level Programming",
            speaker: "Alex Johnson",
            description: "Advanced TypeScript type manipulation techniques",
            votes: 15,
          }
        ]
      }
    ];
    
    setEvents(demoEvents);
  }, []);

  const handleCreateEvent = (eventData) => {
    const newEvent = {
      id: `event-${Date.now()}`,
      ...eventData,
      talks: []
    };
    
    setEvents([...events, newEvent]);
    toast({
      title: "Event Created",
      description: `${eventData.title} has been created successfully`,
    });
    setIsCreateEventOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Lightning Talk Wave
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Submit and vote on lightning talks for upcoming tech conferences and events.
            Connect your web3 wallet to get started.
          </p>
          
          <div className="mt-6 flex justify-center gap-4">
            <Button 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
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
