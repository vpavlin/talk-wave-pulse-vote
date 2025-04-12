
import {
  getEvents,
  getEventById,
  publishEvent,
  submitTalk,
  voteTalk
} from "@/utils/qakulib";

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
  date: string;
  talks: Talk[];
}

export const fetchEvents = async (): Promise<Event[]> => {
  const rawEvents = await getEvents();
  
  // Transform the raw data into our app format
  return rawEvents.map((event: any) => ({
    id: event.id,
    title: event.title,
    description: event.content,
    date: event.createdAt || new Date().toISOString(),
    talks: (event.answers || []).map((talk: any) => ({
      id: talk.id,
      title: talk.title,
      speaker: talk.author || "Anonymous",
      description: talk.content,
      votes: talk.votes || 0,
      createdAt: talk.createdAt || new Date().toISOString(),
    })),
  }));
};

export const fetchEventById = async (eventId: string): Promise<Event | null> => {
  const rawEvent = await getEventById(eventId);
  
  if (!rawEvent) return null;
  
  return {
    id: rawEvent.id,
    title: rawEvent.title,
    description: rawEvent.content,
    date: rawEvent.createdAt || new Date().toISOString(),
    talks: (rawEvent.answers || []).map((talk: any) => ({
      id: talk.id,
      title: talk.title,
      speaker: talk.author || "Anonymous",
      description: talk.content,
      votes: talk.votes || 0,
      createdAt: talk.createdAt || new Date().toISOString(),
    })),
  };
};

export const createEvent = async (
  title: string, 
  description: string, 
  date: string
): Promise<string | null> => {
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
  return await submitTalk(eventId, title, description, speaker);
};

export const upvoteTalk = async (eventId: string, talkId: string): Promise<boolean> => {
  return await voteTalk(eventId, talkId);
};
