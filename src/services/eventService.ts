
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
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: number;
  talks: Talk[];
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

export const fetchEvents = async (): Promise<Event[]> => {
  console.log("Fetching events through service layer");
  const rawEvents = await getEvents();
  
  // Transform the raw data into our app format
  return rawEvents.map((event: any) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.createdAt || new Date().toISOString(),
    talks: (event.questions || []).map((talk: EnhancedQuestionMessage) => {
      console.log(event)
      const parsedContent = parseTalkContent(talk.question);
      return {
        id: talk.hash,
        title: parsedContent.title ||  "Untitled Talk",
        speaker: parsedContent.speaker || "Anonymous",
        description: parsedContent.description,
        votes: talk.upvotes || 0,
        createdAt: talk.timestamp || new Date().toISOString(),
      };
    }),
  }));
};

export const fetchEventById = async (eventId: string): Promise<Event | null> => {
  console.log(`Fetching event ${eventId} through service layer`);
  const rawEvent = await getEventById(eventId);
  
  if (!rawEvent) return null;
  
  // Get detailed talks for this event
  const rawTalks = await getTalks(eventId);
  
  return {
    id: rawEvent.id,
    title: rawEvent.title,
    description: rawEvent.description,
    date: rawEvent.timestamp,
    talks: rawTalks.map((talk: any) => {
      const parsedContent = parseTalkContent(talk.question);
      return {
        id: talk.hash,
        title: parsedContent.title || talk.title || "Untitled Talk",
        speaker: parsedContent.speaker || talk.author || "Anonymous",
        description: parsedContent.description || talk.content,
        votes: talk.upvotes || 0,
        createdAt: talk.createdAt || new Date().toISOString(),
      };
    }),
  };
};

export const createEvent = async (
  title: string, 
  description: string, 
  date: string
): Promise<string | null> => {
  console.log(`Creating new event: ${title}`);
  // Format date to include in description
  const formattedDescription = `${description}\n\nEvent Date: ${date}`;
  
  return await publishEvent(title, formattedDescription, true);
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
