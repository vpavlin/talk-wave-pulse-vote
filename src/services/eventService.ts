
import * as qakulib from '@/utils/qakulib';
import { v4 as uuidv4 } from 'uuid';
import { useWallet } from '@/contexts/WalletContext';

// Define Talk interface for TypeScript
export interface Talk {
  id: string;
  title: string;
  speaker: string;
  description: string;
  bio?: string;
  votes: number;
  isAuthor?: boolean;
  upvotedByMe?: boolean;
  walletAddress?: string;
  createdAt: string;
}

// Define Event interface for TypeScript
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  eventDate?: string;
  location?: string;
  website?: string;
  contact?: string;
  bannerImage?: string;
  ownerAddress?: string;
  isCreator?: boolean;
  talks: Talk[];
}

/**
 * Fetch all events
 */
export const fetchEvents = async () => {
  try {
    const events = await qakulib.getEvents();
    
    // Process each event to ensure proper data structure and parsing
    return events.map(event => ({
      ...event,
      // Parse description if it's a JSON string
      description: parseJsonField(event.description),
      // Ensure date fields are valid
      date: ensureValidDateString(event.timestamp),
      eventDate: event.eventDate ? ensureValidDateString(event.eventDate) : undefined,
      // Ensure talks is always an array
      talks: Array.isArray(event.talks) ? event.talks : [],
      // Set owner address for consistency
      ownerAddress: event.owner || event.ownerAddress
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

/**
 * Parse potentially JSON-encoded data
 */
function parseJsonField(field: any): string {
  if (!field) return '';
  
  if (typeof field === 'string') {
    try {
      // Try to parse it as JSON
      const parsed = JSON.parse(field);
      // If it's an object with a description field, return that
      if (parsed && typeof parsed === 'object') {
        return parsed.description || parsed.text || JSON.stringify(parsed);
      }
      // If it's a string, return it
      if (typeof parsed === 'string') {
        return parsed;
      }
      // Otherwise stringify it again
      return JSON.stringify(parsed);
    } catch (e) {
      // Not valid JSON, return as is
      return field;
    }
  }
  
  // If it's already an object, stringify it
  if (typeof field === 'object') {
    return field?.description || field?.text || JSON.stringify(field);
  }
  
  return String(field);
}

// Helper function to ensure we have a valid ISO date string
function ensureValidDateString(dateValue: any): string {
  if (!dateValue) return new Date().toISOString();
  
  // If it's already a string that looks like an ISO date, return it
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateValue)) {
    return dateValue;
  }
  
  // Try to create a valid date
  try {
    const date = new Date(dateValue);
    // Check if the date is valid
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (e) {
    console.error("Invalid date value:", dateValue);
  }
  
  // Default to current date if we couldn't parse it
  return new Date().toISOString();
}

/**
 * Fetch a single event by ID
 */
export const fetchEventById = async (eventId: string): Promise<Event> => {
  try {
    const event = await qakulib.getEventById(eventId);
    
    // Fetch talks for this event
    const talks = await qakulib.getTalks(eventId);
    
    // Parse the event description if it's JSON
    const parsedDescription = parseJsonField(event.description);
    
    // Convert qakulib ExtendedTalk objects to our Talk interface
    const formattedTalks: Talk[] = Array.isArray(talks) ? talks.map(talk => ({
      id: talk.question || '',
      title: extractTitle(talk),
      speaker: extractSpeaker(talk),
      description: extractDescription(talk),
      bio: extractBio(talk),
      votes: talk.upvotes || 0,
      isAuthor: talk.isAuthor || false,
      upvotedByMe: talk.upvotedByMe || false,
      walletAddress: talk.signer || '',
      createdAt: ensureValidDateString(talk.timestamp)
    })) : [];
    
    // Ensure the date property exists and construct Event object
    return {
      id: event.id || eventId,
      title: event.title || '',
      description: parsedDescription,
      date: ensureValidDateString(event.timestamp),
      eventDate: event.eventDate ? ensureValidDateString(event.eventDate) : undefined,
      location: event.location,
      website: event.website,
      contact: event.contact,
      bannerImage: event.bannerImage,
      ownerAddress: event.owner || event.ownerAddress,
      isCreator: event.isCreator,
      talks: formattedTalks
    };
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    throw error;
  }
};

// Helper functions to extract talk data from the JSON structure
function extractTitle(talk: any): string {
  try {
    if (talk.title) return talk.title;
    if (talk.question && typeof talk.question === 'string') {
      const parsed = JSON.parse(talk.question);
      return parsed.title || '';
    }
    return '';
  } catch (e) {
    return '';
  }
}

function extractSpeaker(talk: any): string {
  try {
    if (talk.speaker) return talk.speaker;
    if (talk.question && typeof talk.question === 'string') {
      const parsed = JSON.parse(talk.question);
      return parsed.speaker || '';
    }
    return '';
  } catch (e) {
    return '';
  }
}

function extractDescription(talk: any): string {
  try {
    if (talk.description) return talk.description;
    if (talk.question && typeof talk.question === 'string') {
      const parsed = JSON.parse(talk.question);
      return parsed.description || '';
    }
    return '';
  } catch (e) {
    return '';
  }
}

function extractBio(talk: any): string | undefined {
  try {
    if (talk.bio) return talk.bio;
    if (talk.question && typeof talk.question === 'string') {
      const parsed = JSON.parse(talk.question);
      return parsed.bio;
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
}

/**
 * Upvote a talk
 */
export const upvoteTalk = async (eventId: string, talkId: string): Promise<boolean> => {
  try {
    console.log(`Upvoting talk ${talkId} for event ${eventId}`);
    
    // Optimistically update the vote count
    const success = await qakulib.voteTalk(eventId, talkId);
    
    return success;
  } catch (error) {
    console.error('Error upvoting talk:', error);
    return false;
  }
};

/**
 * Create a new talk submission
 */
export const createTalk = async (
  eventId: string,
  title: string,
  description: string,
  speaker: string,
  bio?: string
): Promise<string | null> => {
  try {
    console.log(`Creating talk for event ${eventId}`);
    
    // Generate a random ID for the talk
    const talkId = uuidv4();
    
    // Add the talk to the event using qakulib
    const newTalkId = await qakulib.submitTalk(
      eventId,
      title,
      description,
      speaker,
      bio
    );
    
    return newTalkId || talkId;
  } catch (error) {
    console.error('Error creating talk:', error);
    return null;
  }
};

/**
 * Create a new event
 */
export const createEvent = async (
  title: string, 
  description: string, 
  date: string,
  website?: string,
  location?: string,
  contact?: string,
  bannerImage?: string
): Promise<string | null> => {
  try {
    console.log(`Creating new event: ${title}`);
    
    // Use moderation for production, false for testing
    const enableModeration = false;
    
    // Call the qakulib publishEvent function
    const eventId = await qakulib.publishEvent(title, description, enableModeration);
    
    console.log(`Event created with ID: ${eventId}`);
    return eventId;
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
};
