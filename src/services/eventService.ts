
import {
  getEvents,
  getEventById,
  publishEvent,
  submitTalk,
  voteTalk,
  getTalks
} from "@/utils/qakulib";
import { EnhancedQuestionMessage } from "qakulib";

export interface Talk {
  id: string;
  title: string;
  speaker: string;
  description: string;
  votes: number;
  createdAt: string;
  walletAddress?: string; // Author's wallet address
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: number;  // creation timestamp
  eventDate: string; // actual event date
  talks: Talk[];
  ownerAddress?: string; // Event owner's wallet address
  // Added new optional metadata fields
  website?: string;
  location?: string;
  contact?: string;
  bannerImage?: string; // URL to banner image
}

// Helper function to parse question content with better error handling
const parseTalkContent = (content: string): { title: string; description: string; speaker: string } => {
  try {
    // Ensure we're working with a string before parsing
    const contentString = typeof content === 'string' ? content : JSON.stringify(content);
    return JSON.parse(contentString);
  } catch (e) {
    console.error("Failed to parse talk content:", e, "Content was:", content);
    return { title: "Untitled Talk", description: "No description available", speaker: "Anonymous" };
  }
};

// Helper function to parse event description for structured data
const parseEventContent = (description: string): { 
  description: string; 
  eventDate?: string;
  website?: string;
  location?: string;
  contact?: string;
  bannerImage?: string;
} => {
  try {
    // Try to parse as JSON first
    if (description.startsWith('{') && description.endsWith('}')) {
      return JSON.parse(description);
    }
    
    // Legacy format: look for structured data in description
    const dateMatch = description.match(/Event Date: (.+?)(?:\n|$)/);
    const websiteMatch = description.match(/Website: (.+?)(?:\n|$)/);
    const locationMatch = description.match(/Location: (.+?)(?:\n|$)/);
    const contactMatch = description.match(/Contact: (.+?)(?:\n|$)/);
    const bannerMatch = description.match(/Banner: (.+?)(?:\n|$)/);
    
    // Extract the pure description without the metadata lines
    let pureDescription = description;
    const metadataRegex = /(Event Date|Website|Location|Contact|Banner): .+?(?:\n|$)/g;
    pureDescription = pureDescription.replace(metadataRegex, '').trim();
    
    return {
      description: pureDescription,
      eventDate: dateMatch ? dateMatch[1] : undefined,
      website: websiteMatch ? websiteMatch[1] : undefined,
      location: locationMatch ? locationMatch[1] : undefined,
      contact: contactMatch ? contactMatch[1] : undefined,
      bannerImage: bannerMatch ? bannerMatch[1] : undefined,
    };
  } catch (e) {
    console.error("Failed to parse event content:", e);
    return { description };
  }
};

export const fetchEvents = async (): Promise<Event[]> => {
  console.log("Fetching events through service layer");
  const rawEvents = await getEvents();
  
  // Create an array to hold the fully populated events
  const populatedEvents = [];
  
  // Transform the raw data into our app format and fetch detailed talks for each event
  for (const event of rawEvents) {
    const parsedContent = parseEventContent(event.description || '');
    
    // Fetch detailed talks for this event
    console.log(`Fetching talks for event ${event.id} on main page`);
    const rawTalks = await getTalks(event.id);
    
    populatedEvents.push({
      id: event.id,
      title: event.title,
      description: parsedContent.description || event.description,
      date: event.createdAt || Date.now(),
      eventDate: parsedContent.eventDate || '',
      ownerAddress: event.owner || '', // Changed: Use owner property for events
      website: parsedContent.website || '',
      location: parsedContent.location || '',
      contact: parsedContent.contact || '',
      bannerImage: parsedContent.bannerImage || '',
      talks: rawTalks.map((talk: any) => {
        const parsedContent = parseTalkContent(talk.question);
        return {
          id: talk.hash,
          title: parsedContent.title || "Untitled Talk",
          speaker: parsedContent.speaker || "Anonymous",
          description: parsedContent.description,
          votes: talk.upvotes || 0,
          createdAt: talk.timestamp || new Date().toISOString(),
          walletAddress: talk.signer || '', // Changed: Use signer property for talks
        };
      }),
    });
  }
  
  return populatedEvents;
};

export const fetchEventById = async (eventId: string): Promise<Event | null> => {
  console.log(`Fetching event ${eventId} through service layer`);
  const rawEvent = await getEventById(eventId);
  
  if (!rawEvent) return null;
  
  // Get detailed talks for this event
  const rawTalks = await getTalks(eventId);
  
  // Parse the event description for structured data
  const parsedContent = parseEventContent(rawEvent.description || '');
  
  return {
    id: rawEvent.id,
    title: rawEvent.title,
    description: parsedContent.description || rawEvent.description,
    date: rawEvent.timestamp,
    eventDate: parsedContent.eventDate || '',
    ownerAddress: rawEvent.owner || '', // Changed: Use owner property for events
    website: parsedContent.website || '',
    location: parsedContent.location || '',
    contact: parsedContent.contact || '',
    bannerImage: parsedContent.bannerImage || '',
    talks: rawTalks.map((talk: any) => {
      const parsedContent = parseTalkContent(talk.question);
      return {
        id: talk.hash,
        title: parsedContent.title || talk.title || "Untitled Talk",
        speaker: parsedContent.speaker || talk.author || "Anonymous",
        description: parsedContent.description || talk.content,
        votes: talk.upvotes || 0,
        createdAt: talk.createdAt || new Date().toISOString(),
        walletAddress: talk.signer || '', // Changed: Use signer property for talks
      };
    }),
  };
};

export const createEvent = async (
  title: string, 
  description: string, 
  date: string,
  website?: string,
  location?: string,
  contact?: string,
  bannerImage?: string
): Promise<string | null> => {
  console.log(`Creating new event: ${title}`);
  
  // Create structured event data
  const eventData = JSON.stringify({
    description,
    eventDate: date,
    website,
    location,
    contact,
    bannerImage
  });
  
  return await publishEvent(title, eventData, true);
};

export const createTalk = async (
  eventId: string, 
  title: string, 
  description: string, 
  speaker: string
): Promise<string | null> => {
  console.log(`Creating new talk: ${title} by ${speaker}`);
  return await submitTalk(eventId, title, description, speaker);
};

export const upvoteTalk = async (eventId: string, talkId: string): Promise<boolean> => {
  console.log(`Upvoting talk ${talkId} in event ${eventId}`);
  return await voteTalk(eventId, talkId);
};
