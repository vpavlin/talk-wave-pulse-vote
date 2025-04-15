import { 
  getEvents as fetchEventsFromQakulib, 
  getEventById as fetchEventByIdFromQakulib,
  getTalks as fetchTalksFromQakulib,
  publishEvent as publishEventToQakulib,
  submitTalk as submitTalkToQakulib,
  voteTalk as voteTalkToQakulib,
  closeEvent as closeEventInQakulib,
  acceptTalk as acceptTalkInQakulib,
  announcedEvents
} from "@/utils/qakulib";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export interface Talk {
  id: string;
  title: string;
  description: string;
  speaker: string;
  bio?: string;
  votes: number;
  voters?: string[];
  voterAddresses?: string[];
  walletAddress?: string;
  isAuthor?: boolean;
  upvotedByMe?: boolean;
  createdAt: string | number | Date;
  answer?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  ownerAddress?: string;
  isCreator?: boolean;
  eventDate?: string;
  date?: string | number | Date;
  location?: string;
  website?: string;
  contact?: string;
  bannerImage?: string;
  talks: Talk[];
  enabled?: boolean;
}

export const fetchEvents = async (): Promise<Event[]> => {
  try {
    console.log("Fetching all events");
    
    const rawEvents = await fetchEventsFromQakulib();
    
    const combinedEvents = [
      ...rawEvents,
      ...announcedEvents.filter(
        announcedEvent => !rawEvents.some(event => event.id === announcedEvent.id)
      )
    ];
    
    console.log("Combined events:", combinedEvents);
    
    const processedEvents = [];
    
    for (const event of combinedEvents) {
      const eventTalks = rawEvents.some(e => e.id === event.id) 
        ? await fetchTalksFromQakulib(event.id) 
        : [];
      
      processedEvents.push({
        id: event.id,
        title: event.title || 'Untitled Event',
        description: parseEventDescription(event.description),
        ownerAddress: event.ownerAddress || event.owner,
        isCreator: event.isCreator || false,
        eventDate: event.eventDate ? String(event.eventDate) : undefined,
        date: event.timestamp || event.updated,
        location: event.location,
        website: event.website,
        contact: event.contact,
        bannerImage: event.bannerImage,
        enabled: event.enabled !== false,
        talks: (eventTalks || []).map(talk => ({
          id: talk.hash,
          title: extractTalkData(talk.question || '').title || 'Unknown Talk',
          description: extractTalkData(talk.question || '').description || '',
          speaker: extractTalkData(talk.question || '').speaker || 'Anonymous',
          bio: extractTalkData(talk.question || '').bio,
          votes: talk.upvotes || 0,
          voterAddresses: talk.voterAddresses || [],
          walletAddress: talk.signer,
          isAuthor: talk.isAuthor || false,
          upvotedByMe: talk.upvotedByMe || false,
          createdAt: talk.timestamp || new Date(),
          answer: talk.answer
        }))
      });
    }
    
    return processedEvents;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
};

export const parseEventDescription = (description: string | undefined): string => {
  if (!description) return '';
  
  try {
    const descObj = JSON.parse(description);
    
    if (descObj && typeof descObj === 'object' && descObj.description) {
      return descObj.description;
    }
    
    return description;
  } catch (e) {
    return description;
  }
};

export const fetchEventById = async (eventId: string): Promise<Event | null> => {
  const event = await fetchEventByIdFromQakulib(eventId);
  
  if (!event) {
    return null;
  }
  
  console.log("Raw event:", event);
  
  return {
    id: event.id,
    title: event.title || 'Untitled Event',
    description: parseEventDescription(event.description),
    ownerAddress: event.ownerAddress || event.owner,
    isCreator: event.isCreator || false,
    eventDate: event.eventDate ? String(event.eventDate) : undefined,
    date: event.timestamp || event.updated,
    location: event.location,
    website: event.website,
    contact: event.contact,
    bannerImage: event.bannerImage,
    enabled: event.enabled,
    talks: (event.talks || []).map(talk => ({
      id: talk.hash,
      title: extractTalkData(talk.question || '').title || 'Unknown Talk',
      description: extractTalkData(talk.question || '').description || '',
      speaker: extractTalkData(talk.question || '').speaker || 'Anonymous',
      bio: extractTalkData(talk.question || '').bio,
      votes: talk.upvotes || 0,
      voterAddresses: talk.voterAddresses || [],
      walletAddress: talk.signer,
      isAuthor: talk.isAuthor || false,
      upvotedByMe: talk.upvotedByMe || false,
      createdAt: talk.timestamp || new Date(),
      answer: talk.answer
    }))
  };
};

export const extractTalkData = (talkData: string): { title?: string; description?: string; speaker?: string; bio?: string } => {
  try {
    const data = JSON.parse(talkData);
    return {
      title: data.title,
      description: data.description,
      speaker: data.speaker,
      bio: data.bio
    };
  } catch (e) {
    console.error("Error parsing talk data:", e);
    return {
      title: talkData,
      description: '',
      speaker: 'Anonymous'
    };
  }
};

export const createEvent = async (
  title: string,
  description: string,
  eventDate?: string,
  location?: string,
  website?: string,
  contact?: string,
  bannerImage?: string
): Promise<string | null> => {
  try {
    const descriptionWithMetadata = JSON.stringify({
      description,
      eventDate,
      location,
      website,
      contact,
      bannerImage
    });
    
    const eventId = await publishEventToQakulib(title, descriptionWithMetadata, true);
    return eventId;
  } catch (error) {
    console.error("Error creating event:", error);
    return null;
  }
};

export const createTalk = async (
  eventId: string,
  title: string,
  description: string,
  speaker: string,
  bio?: string
): Promise<string | null> => {
  try {
    const talkData = JSON.stringify({ title, description, speaker, bio });
    return await submitTalkToQakulib(eventId, title, description, speaker, bio);
  } catch (error) {
    console.error("Error creating talk:", error);
    return null;
  }
};

export const upvoteTalk = async (eventId: string, talkId: string): Promise<boolean> => {
  try {
    return await voteTalkToQakulib(eventId, talkId);
  } catch (error) {
    console.error("Error upvoting talk:", error);
    return false;
  }
};

export const closeEvent = async (eventId: string): Promise<boolean> => {
  try {
    return await closeEventInQakulib(eventId);
  } catch (error) {
    console.error("Error closing event:", error);
    return false;
  }
};

export const acceptTalk = async (eventId: string, talkId: string, feedback?: string): Promise<boolean> => {
  try {
    return await acceptTalkInQakulib(eventId, talkId, feedback);
  } catch (error) {
    console.error("Error accepting talk:", error);
    return false;
  }
};
