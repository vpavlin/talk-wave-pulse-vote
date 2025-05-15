
import React from "react";
import { Wallet, MapPin, Link as LinkIcon, Phone } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, LockOpen, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Event } from "@/services/eventService";

interface EventDetailsProps {
  event: Event;
  formatEventDate: (dateString: string | undefined) => string;
  formatWalletAddress: (address: string | undefined) => string;
  onCloseEvent: () => void;
  renderWebsiteLink: (website: string) => React.ReactNode;
}

const EventDetails = ({ 
  event, 
  formatEventDate, 
  formatWalletAddress, 
  onCloseEvent,
  renderWebsiteLink 
}: EventDetailsProps) => {
  const eventBanner = event?.bannerImage ? (
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
    <>
      {eventBanner}
      
      <Card className="mb-8 border-purple-100 dark:border-purple-900 bg-white/90 dark:bg-gray-800/90 backdrop-blur glass-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <CardTitle className="text-3xl md:text-4xl font-bold text-purple-800 dark:text-purple-300 mb-2">
                  {event?.title}
                </CardTitle>
                <Badge 
                  variant={event?.enabled ? "default" : "destructive"}
                  className="text-sm py-1 px-2"
                >
                  {event?.enabled ? (
                    <div className="flex items-center">
                      <LockOpen className="h-3 w-3 mr-1" />
                      Open
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Closed
                    </div>
                  )}
                </Badge>
              </div>
              <div className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert prose-p:my-2 max-w-none">
                <ReactMarkdown>{event?.description || ""}</ReactMarkdown>
              </div>
              
              <div className="mt-4 space-y-2">
                {event?.ownerAddress && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <Wallet className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Created by: {event.externalWallet || formatWalletAddress(event.ownerAddress)}</span>
                  </div>
                )}
                
                {event?.location && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{event.location}</span>
                  </div>
                )}
                
                {event?.website && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    {renderWebsiteLink(event.website)}
                  </div>
                )}
                
                {event?.contact && (
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
            
            <div className="flex flex-col gap-2 items-start md:items-center">
              <Badge className="date-badge text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-1" />
                {formatEventDate(event?.eventDate)}
              </Badge>
              
              {event?.isCreator && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onCloseEvent}
                  disabled={event.enabled === false}
                  aria-label={event?.enabled ? "Close event for submissions" : "Event already closed"}
                  className="mt-2"
                >
                  <X className="mr-2 h-4 w-4" />
                  {event?.enabled ? "Close Event" : "Event Closed"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    </>
  );
};

export default EventDetails;
