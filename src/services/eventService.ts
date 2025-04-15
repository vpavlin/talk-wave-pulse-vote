import qakulib from '@/utils/qakulib';
import { v4 as uuidv4 } from 'uuid';
import { useWallet } from '@/contexts/WalletContext';

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
