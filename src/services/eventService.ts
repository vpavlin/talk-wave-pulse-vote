
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
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

/**
 * Fetch a single event by ID
 */
export const fetchEventById = async (eventId: string) => {
  try {
    const event = await qakulib.getEventById(eventId);
    return event;
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    throw error;
  }
};

/**
 * Upvote a talk
 */
export const upvoteTalk = async (eventId: string, talkId: string): Promise<boolean> => {
  try {
    console.log(`Upvoting talk ${talkId} for event ${eventId}`);
    
    // Optimistically update the vote count
    const success = await qakulib.upvoteTalk(eventId, talkId);
    
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
    
    // Add the talk to the event
    const eventUpdateMessage = {
      eventId: eventId,
      talk: {
        id: talkId,
        title: title,
        speaker: speaker,
        description: description,
        bio: bio || '', // Add the bio field
        votes: 0,
        isAuthor: true, // Mark the talk as owned by the user
        createdAt: new Date().toISOString()
      }
    };
    
    await qakulib.submitTalk(eventUpdateMessage);
    
    return talkId;
  } catch (error) {
    console.error('Error creating talk:', error);
    return null;
  }
};

// Add the missing createEvent function
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
