
// Using the locally installed qakulib package
import {EnhancedQuestionMessage, Qaku} from "qakulib";
import { wakuPeerExchangeDiscovery } from "@waku/discovery";
import { derivePubsubTopicsFromNetworkConfig } from "@waku/utils"
import { createLightNode, IWaku, LightNode, Protocols } from '@waku/sdk';

// Initialize the Qakulib instance
let qakulibInstance: any | null = null;

const bootstrapNodes: string[] = [
  "/dns4/waku-test.bloxy.one/tcp/8095/wss/p2p/16Uiu2HAmSZbDB7CusdRhgkD81VssRjQV5ZH13FbzCGcdnbbh6VwZ",
  "/dns4/node-01.do-ams3.waku.sandbox.status.im/tcp/8000/wss/p2p/16Uiu2HAmNaeL4p3WEYzC9mgXBmBWSgWjPHRvatZTXnp8Jgv3iKsb",
]

const networkConfig =  {clusterId: 42, shards: [0]}

// Event handlers for qakulib events
let eventListeners: any[] = [];

export const getQakulib = async ():Promise<Qaku> => {
  if (!qakulibInstance) {
    console.log("Initializing Qakulib instance");
    const node:IWaku = await createLightNode({            
      networkConfig:networkConfig,
      defaultBootstrap: false,
      bootstrapPeers: bootstrapNodes,
      numPeersToUse: 3,
      libp2p: {
        peerDiscovery: [
          wakuPeerExchangeDiscovery(derivePubsubTopicsFromNetworkConfig(networkConfig))
        ]
      }, });
    await node.start();
    
    // Wait for connection to at least one peer
    await node.waitForPeers([Protocols.Store, Protocols.Filter, Protocols.LightPush]);
    
    qakulibInstance = new Qaku(node as LightNode);
    await qakulibInstance.init();

    // Set up event listeners for qakulib events
    setupEventListeners();
  }
  return qakulibInstance;
};

// Set up event listeners for Qakulib instance
const setupEventListeners = () => {
  if (!qakulibInstance) return;

  // Clean up existing listeners to avoid duplicates
  for (const listener of eventListeners) {
    if (listener && listener.remove) {
      listener.remove();
    }
  }
  eventListeners = [];

  // Listen for new QA events
  const newQaListener = qakulibInstance.on('qa:new', (qaId: string) => {
    console.log('New QA event received:', qaId);
    // This will trigger a data refresh in the UI through React Query's invalidation
  });

  // Listen for new questions (talks) within a QA event
  const newQuestionListener = qakulibInstance.on('question:new', (qaId: string, questionId: string) => {
    console.log('New question received for QA:', qaId, 'Question ID:', questionId);
    // This will trigger a data refresh in the UI through React Query's invalidation
  });

  // Listen for vote updates
  const voteUpdateListener = qakulibInstance.on('question:vote', (qaId: string, questionId: string) => {
    console.log('Vote update for QA:', qaId, 'Question ID:', questionId);
    // This will trigger a data refresh in the UI through React Query's invalidation
  });

  // Store listeners for cleanup
  eventListeners.push(newQaListener, newQuestionListener, voteUpdateListener);
};

export const publishEvent = async (title:string, desc:string, moderation:boolean):Promise<string> => {
  console.log("Publishing new event:", title);
  const qakulib = await getQakulib();
  
  // Create new QA event
  const eventId = await qakulib.newQA(title, desc, true, [], moderation);
  
  console.log("Event published with ID:", eventId);
  return eventId;
}

export const getEvents = async (): Promise<any[]> => {
  try {
    console.log("Fetching all events from qakulib");
    const qakulib = await getQakulib();
    
    // Ensure we're loading latest data from IndexedDB and Waku network
    await qakulib.refresh();
    
    const eventsList = qakulib.qas.values();
    const events = [];
    for (const event of eventsList) {
      events.push(event.controlState);
    }
    console.log(`Found ${events.length} events`);
    return events;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
};

export const getEventById = async (eventId: string): Promise<any | null> => {
  try {
    console.log(`Fetching event with ID ${eventId}`);
    const qakulib = await getQakulib();
    
    // Ensure we're loading latest data for this specific event
    await qakulib.refreshQA(eventId);
    
    const event = qakulib.qas.get(eventId);
    if (!event) {
      console.warn(`Event with ID ${eventId} not found`);
      return null;
    }
    
    console.log(`Successfully retrieved event: ${event.controlState.title}`);
    return event.controlState;
  } catch (error) {
    console.error(`Failed to fetch event with ID ${eventId}:`, error);
    return null;
  }
};

export const getTalks = async (eventId: string): Promise<EnhancedQuestionMessage[]> => {
  try {
    console.log(`Fetching talks for event ${eventId}`);
    const qakulib = await getQakulib();
    
    // Ensure we're loading latest data for this specific event
    await qakulib.refreshQA(eventId);
    
    const event = qakulib.qas.get(eventId);
    if (!event) {
      console.warn(`Event with ID ${eventId} not found when fetching talks`);
      return [];
    }
    
    const talksList = event.questions.values();
    const talks = [];
    for (const talk of talksList) {
      talks.push(talk);
    }
    
    console.log(`Found ${talks.length} talks for event ${eventId}`);
    return talks;
  } catch (error) {
    console.error("Failed to fetch talks:", error);
    return [];
  }
};

export const submitTalk = async (
  eventId: string, 
  title: string, 
  description: string,
  speaker: string
): Promise<string | null> => {
  try {
    console.log(`Submitting talk "${title}" for event ${eventId}`);
    const qakulib = await getQakulib();
    
    // Ensure we have the latest data for this event
    await qakulib.refreshQA(eventId);
    
    // Format talk data for submission
    const talkData = JSON.stringify({title, description, speaker});
    
    // Submit the new question (talk)
    const talkId = await qakulib.newQuestion(eventId, talkData);
    
    console.log(`Talk submitted successfully with ID: ${talkId}`);
    return talkId;
  } catch (error) {
    console.error("Failed to submit talk:", error);
    return null;
  }
};

export const voteTalk = async (eventId: string, talkId: string): Promise<boolean> => {
  try {
    console.log(`Voting for talk ${talkId} in event ${eventId}`);
    const qakulib = await getQakulib();
    
    // Ensure we have the latest data for this event
    await qakulib.refreshQA(eventId);
    
    // Cast vote for the talk
    await qakulib.upvote(eventId, talkId);
    
    console.log(`Vote recorded successfully for talk ${talkId}`);
    return true;
  } catch (error) {
    console.error("Failed to vote for talk:", error);
    return false;
  }
};
