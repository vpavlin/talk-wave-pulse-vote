
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Event } from "@/services/eventService";

interface EventListProps {
  events: Event[];
}

const EventList = ({ events }: EventListProps) => {
  const [filter, setFilter] = useState("all");
  
  const filteredEvents = events.filter(event => {
    if (filter === "all") return true;
    if (filter === "upcoming") {
      const eventDate = new Date(event.date);
      return eventDate >= new Date();
    }
    return false;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-black dark:text-white">Events</h2>
        <div className="flex gap-2">
          <Button 
            variant={filter === "all" ? "default" : "outline"}
            size="lg"
            onClick={() => setFilter("all")}
            className={`text-lg ${filter === "all" ? "bg-black text-white" : "text-black dark:text-white border-black dark:border-white"}`}
            aria-pressed={filter === "all"}
          >
            All Events
          </Button>
          <Button 
            variant={filter === "upcoming" ? "default" : "outline"}
            size="lg"
            onClick={() => setFilter("upcoming")}
            className={`text-lg ${filter === "upcoming" ? "bg-black text-white" : "text-black dark:text-white border-black dark:border-white"}`}
            aria-pressed={filter === "upcoming"}
          >
            Upcoming
          </Button>
        </div>
      </div>
      
      {filteredEvents.length === 0 ? (
        <Card className="border-gray-300 dark:border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400">No events found. Create a new event to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card 
              key={event.id} 
              className="border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl text-black dark:text-white font-bold">
                    {event.title}
                  </CardTitle>
                  <Badge className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(event.date), "MMM d, yyyy")}
                  </Badge>
                </div>
                <CardDescription className="mt-2 text-gray-700 dark:text-gray-300">
                  {event.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-3 flex gap-2 items-center">
                  <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                    {event.talks.length} {event.talks.length === 1 ? 'talk' : 'talks'} submitted
                  </p>
                </div>
                <Link to={`/event/${event.id}`} className="block">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full border-black dark:border-white text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 group"
                  >
                    View Event
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;

