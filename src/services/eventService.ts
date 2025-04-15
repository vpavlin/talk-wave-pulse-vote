import * as qakulib from '@/utils/qakulib';
import { v4 as uuidv4 } from 'uuid';

// Define Talk interface for TypeScript
export interface Talk {
  id: string;
  title: string;
  description: string;
  speaker: string;
  bio?: string;
  votes: number;
  voterAddresses: string[];
  isAuthor: boolean;
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
  timestamp?: number;
  updated?: number;
  enabled: boolean; // Add enabled property to track if the event is open/closed
}

/**
 * Fetch all events
 */
export const fetchEvents = async () => {
  try {
    const events = await qakulib.getEvents();
    
    // Process each event to ensure proper data structure and parsing
    return Promise.all(events.map(async event => {
      // Fetch talks for each event
      const talks = await qakulib.getTalks(event.id);
      
      // Convert qakulib ExtendedTalk objects to our Talk interface
      const formattedTalks: Talk[] = Array.isArray(talks) ? talks.map(talk => {
        // Extract properties
        const talkTitle = extractTitle(talk);
        const talkSpeaker = extractSpeaker(talk);
        const talkDesc = extractDescription(talk);
        const talkBio = extractBio(talk);
        
        return {
          id: talk.hash || '',
          title: talkTitle,
          speaker: talkSpeaker,
          description: talkDesc,
          bio: talkBio,
          votes: talk.upvotes || 0,
          voterAddresses: talk.voterAddresses || [],
          isAuthor: talk.isAuthor || false,
          upvotedByMe: talk.upvotedByMe || false,
          walletAddress: talk.signer || '',
          createdAt: ensureValidDateString(talk.timestamp)
        };
      }) : [];
      
      // Ensure we have a valid Event object with all required properties
      return {
        id: event.id, // This is now required in both interfaces
        title: event.title || '',
        description: parseJsonField(event.description),
        date: ensureValidDateString(event.timestamp || new Date()),
        eventDate: event.eventDate ? ensureValidDateString(event.eventDate) : undefined,
        location: event.location,
        website: event.website,
        contact: event.contact,
        bannerImage: event.bannerImage,
        ownerAddress: event.owner || event.ownerAddress,
        isCreator: event.isCreator,
        talks: formattedTalks,
        timestamp: typeof event.timestamp === 'number' ? event.timestamp : 0,
        updated: typeof event.updated === 'number' ? event.updated : 0,
        enabled: event.enabled
      } as Event;
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Helper functions for field parsing
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
    
    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }
    
    // Fetch talks for this event
    const talks = await qakulib.getTalks(eventId);
    
    // Parse the event description to extract embedded metadata
    let parsedDescription = '';
    let eventDate = undefined;
    let location = undefined;
    let website = undefined;
    let contact = undefined;
    let bannerImage = undefined;
    
    // Try to extract metadata from description if it's a JSON string
    if (typeof event.description === 'string') {
      try {
        const descObj = JSON.parse(event.description);
        if (descObj && typeof descObj === 'object') {
          parsedDescription = descObj.description || '';
          eventDate = descObj.eventDate;
          location = descObj.location;
          website = descObj.website;
          contact = descObj.contact;
          bannerImage = descObj.bannerImage;
        } else {
          parsedDescription = event.description;
        }
      } catch (e) {
        // Not valid JSON, use as is
        parsedDescription = event.description;
      }
    } else {
      parsedDescription = parseJsonField(event.description);
    }
    
    // Convert qakulib ExtendedTalk objects to our Talk interface
    const formattedTalks: Talk[] = Array.isArray(talks) ? talks.map(talk => {
      // Extract properties with detailed console logging
      const talkTitle = extractTitle(talk);
      const talkSpeaker = extractSpeaker(talk);
      const talkDesc = extractDescription(talk);
      const talkBio = extractBio(talk);
      
      console.log("Extracted talk data:", {
        id: talk.hash || '',
        title: talkTitle,
        speaker: talkSpeaker,
        bioExists: !!talkBio,
        isAuthor: talk.isAuthor || false,
        walletAddress: talk.signer || ''
      });
      
      return {
        id: talk.hash || '',
        title: talkTitle,
        speaker: talkSpeaker,
        description: talkDesc,
        bio: talkBio,
        votes: talk.upvotes || 0,
        voterAddresses: talk.voterAddresses || [],
        isAuthor: talk.isAuthor || false,
        upvotedByMe: talk.upvotedByMe || false,
        walletAddress: talk.signer || '',
        createdAt: ensureValidDateString(talk.timestamp)
      };
    }) : [];
    
    // Make sure we capture all the event metadata
    console.log("Raw event data:", event);
    
    // Use the extracted metadata or fall back to event properties
    return {
      id: event.id,
      title: event.title || '',
      description: parsedDescription,
      date: ensureValidDateString(event.timestamp || new Date()),
      eventDate: eventDate || (event.eventDate && typeof event.eventDate !== 'object' ? ensureValidDateString(event.eventDate) : undefined),
      location: location || (event.location && typeof event.location !== 'object' ? event.location : undefined),
      website: website || (event.website && typeof event.website !== 'object' ? event.website : undefined),
      contact: contact || (event.contact && typeof event.contact !== 'object' ? event.contact : undefined),
      bannerImage: bannerImage || (event.bannerImage && typeof event.bannerImage !== 'object' ? event.bannerImage : undefined),
      ownerAddress: event.owner || event.ownerAddress,
      isCreator: event.isCreator,
      talks: formattedTalks,
      timestamp: event.timestamp,
      updated: event.updated,
      enabled: event.enabled
    };
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    throw error;
  }
};

// Helper functions to extract talk data from the JSON structure with improved logging
function extractTitle(talk: any): string {
  try {
    if (talk.title) return talk.title;
    
    if (talk.question && typeof talk.question === 'string') {
      try {
        const parsed = JSON.parse(talk.question);
        const title = parsed.title || '';
        console.log("Extracted title from JSON:", title);
        return title;
      } catch (e) {
        console.log("Using question as title:", talk.question);
        return talk.question;
      }
    }
    return '';
  } catch (e) {
    console.error("Error extracting title:", e);
    return '';
  }
}

function extractSpeaker(talk: any): string {
  try {
    if (talk.speaker) return talk.speaker;
    
    if (talk.question && typeof talk.question === 'string') {
      try {
        const parsed = JSON.parse(talk.question);
        const speaker = parsed.speaker || '';
        console.log("Extracted speaker from JSON:", speaker);
        return speaker;
      } catch (e) {
        return '';
      }
    }
    return '';
  } catch (e) {
    console.error("Error extracting speaker:", e);
    return '';
  }
}

function extractDescription(talk: any): string {
  try {
    if (talk.description) return talk.description;
    
    if (talk.question && typeof talk.question === 'string') {
      try {
        const parsed = JSON.parse(talk.question);
        const description = parsed.description || '';
        console.log("Extracted description from JSON:", description.substring(0, 50) + "...");
        return description;
      } catch (e) {
        return '';
      }
    }
    return '';
  } catch (e) {
    console.error("Error extracting description:", e);
    return '';
  }
}

function extractBio(talk: any): string | undefined {
  try {
    if (talk.bio) {
      console.log("Using talk.bio directly:", talk.bio.substring(0, 50) + "...");
      return talk.bio;
    }
    
    if (talk.question && typeof talk.question === 'string') {
      try {
        const parsed = JSON.parse(talk.question);
        if (parsed.bio) {
          console.log("Extracted bio from JSON:", parsed.bio.substring(0, 50) + "...");
          return parsed.bio;
        }
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  } catch (e) {
    console.error("Error extracting bio:", e);
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

// Add new function to close an event
export const closeEvent = async (eventId: string): Promise<boolean> => {
  try {
    return await qakulib.closeEvent(eventId);
  } catch (error) {
    console.error("Error closing event:", error);
    return false;
  }
};
