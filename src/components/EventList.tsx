
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface Talk {
  id: string;
  title: string;
  speaker: string;
  description: string;
  votes: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  talks: Talk[];
}

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Events</h2>
        <div className="flex gap-2">
          <Button 
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            All Events
          </Button>
          <Button 
            variant={filter === "upcoming" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("upcoming")}
            className={filter === "upcoming" ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            Upcoming
          </Button>
        </div>
      </div>
      
      {filteredEvents.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">No events found. Create a new event to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600/10 to-indigo-600/10 pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-purple-800">{event.title}</CardTitle>
                    <CardDescription className="mt-1">{event.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1 border-purple-200 text-purple-700">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(event.date), "MMM d, yyyy")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-3">
                  <p className="text-sm text-gray-500">{event.talks.length} talk submissions</p>
                </div>
                <Link to={`/event/${event.id}`}>
                  <Button variant="outline" className="w-full mt-2 border-purple-200 text-purple-700 hover:bg-purple-50 group">
                    View Event
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
