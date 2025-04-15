
// Using the locally installed qakulib package
import {ControlMessage, EnhancedQuestionMessage, Qaku} from "qakulib";
import { wakuPeerExchangeDiscovery } from "@waku/discovery";
import { derivePubsubTopicsFromNetworkConfig } from "@waku/utils"
import { createLightNode, IWaku, LightNode, Protocols } from '@waku/sdk';

// Define an extended interface for the talk without extending EnhancedQuestionMessage
interface ExtendedTalk {
  question?: string;
  hash: string; // Make hash required
  voterAddresses?: string[];
  isAuthor?: boolean;
  upvoters?: string[];
  upvotes?: number;
  upvotedByMe?: boolean;
  signer?: string;
  timestamp?: string | number | Date;
}

// Define an extended interface for the control message without extending ControlMessage
interface ExtendedControlMessage {
  id: string; // Make id required
  isCreator?: boolean;
  owner?: string;
  ownerAddress?: string;
  qaId?: string;
  eventDate?: string | number | Date;
  location?: string;
  website?: string;
  contact?: string;
  bannerImage?: string;
  talks?: ExtendedTalk[];
  title?: string;
  description?: string;
  timestamp?: string | number | Date;
  updated?: number;
}

// Initialize the Qakulib instance
let qakulibInstance: any | null = null;

const bootstrapNodes: string[] = [
  "/dns4/waku-test.bloxy.one/tcp/8095/wss/p2p/16Uiu2HAmSZbDB7CusdRhgkD81VssRjQV5ZH13FbzCGcdnbbh6VwZ",
  "/dns4/node-01.do-ams3.waku.sandbox.status.im/tcp/8000/wss/p2p/16Uiu2HAmNaeL4p3WEYzC9mgXBmBWSgWjPHRvatZTXnp8Jgv3iKsb",
]

const networkConfig =  {clusterId: 42, shards: [0]}

// Event handlers for qakulib events
let eventListeners: any[] = [];

let initializing = false
let initPromise: Promise<Qaku>;

export const getQakulib = async ():Promise<Qaku> => {
  if (initializing) return initPromise
  if (!initializing && !qakulibInstance) {
    initializing = true;

    initPromise = new Promise(async (resolve) => {
    try {
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

      // Load history and initialize all QA events we've interacted with
      await loadHistoryAndInitializeQAs(qakulibInstance);

      // Set up event listeners for qakulib events
      setupEventListeners();
    } catch (error) {
      console.error("Error initializing Qakulib:", error);
      throw error;
    }

    resolve(qakulibInstance)
  })
  }
  return initPromise;
};

// Load history and initialize QA events from history
const loadHistoryAndInitializeQAs = async (qakulib: Qaku) => {
  try {
    console.log("Loading QA events from history");
    
    // Use the getAll method from the history object to retrieve all known QAs
    const knownQAs = qakulib.history.getAll ? qakulib.history.getAll() : [];
    
    console.log(`Found ${knownQAs.length} QA events in history`);
    
    // Initialize each QA event from history to ensure proper subscription
    for (const qaEvent of knownQAs) {
      console.log(qaEvent)
      // Extract the QA ID from the history entry using toString() method
      const qaId = qaEvent.id

      console.log(qaId)
      
      console.log(`Initializing QA event from history: ${qaId}`);
      try {
        await qakulib.initQA(qaId);
        console.log(`Successfully initialized QA event: ${qaId}`);
      } catch (error) {
        console.error(`Failed to initialize QA event ${qaId}:`, error);
      }
    }
  } catch (error) {
    console.error("Error loading history:", error);
  }
};

// Setup event listeners
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

export const getEvents = async (): Promise<ExtendedControlMessage[]> => {
  try {
    console.log("Fetching all events from qakulib");
    const qakulib = await getQakulib();
    
    // Instead of calling refresh(), just work with the data we have
    // The event listeners will take care of real-time updates
    
    const eventsList = qakulib.qas.values();
    const events: ExtendedControlMessage[] = [];

    
    // Get current user address for comparison - handle safely
    const currentUserAddress = qakulib.identity && 
                              qakulib.identity.address && 
                              typeof qakulib.identity.address === 'function' ? 
                              qakulib.identity.address() : '';
    
    for (const event of eventsList) {
      // Ensure we have an ID to use
      const eventId = event.controlState?.id || (event as any).id || '';
      
      // Create extended control state with additional properties
      const extendedEvent: ExtendedControlMessage = {
        id: eventId, // Ensure id is always present and required
        title: event.controlState?.title,
        description: event.controlState?.description,
        owner: event.controlState?.owner,
        timestamp: event.controlState?.timestamp,
        updated: event.controlState?.updated
      };
      
      // Check if the current user is the creator of this event
      if (extendedEvent.owner === currentUserAddress) {
        extendedEvent.isCreator = true;
      }
      
      // Set ownerAddress for consistency
      extendedEvent.ownerAddress = extendedEvent.owner;
      
      if (typeof extendedEvent.description === 'string') {
        try {
          const descObj = JSON.parse(extendedEvent.description);
          console.log(descObj)
          if (descObj && typeof descObj === 'object') {
            extendedEvent.eventDate = descObj.eventDate;
            extendedEvent.location = descObj.location;
            extendedEvent.website = descObj.website;
            extendedEvent.contact = descObj.contact;
            extendedEvent.bannerImage = descObj.bannerImage;
          }
        } catch (e) {
          // Not valid JSON, leave as is
        }
      }
      
      // Log the event data for debugging - use a safe approach to access event ID
      console.log("Event data:", extendedEvent.id, extendedEvent);
      
      events.push(extendedEvent);
    }
    
    console.log(`Found ${events.length} events`);
    return events;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
};

export const getEventById = async (eventId: string): Promise<ExtendedControlMessage | null> => {
  try {
    console.log(`Fetching event with ID ${eventId}`);
    const qakulib = await getQakulib();
    
    // Make sure the QA is initialized
    if (!qakulib.qas.has(eventId)) {
      console.log(`Event ${eventId} not initialized yet, initializing...`);
      await qakulib.initQA(eventId);
    }
    
    const event = qakulib.qas.get(eventId);
    if (!event) {
      console.warn(`Event with ID ${eventId} not found`);
      return null;
    }
    
    // Add identity check for creator - handle safely
    const currentUserAddress = qakulib.identity && 
                              qakulib.identity.address && 
                              typeof qakulib.identity.address === 'function' ? 
                              qakulib.identity.address() : '';
    
    // Create an ExtendedControlMessage with required id property
    const extendedControlState: ExtendedControlMessage = {
      id: eventId,
      title: event.controlState?.title,
      description: event.controlState?.description,
      owner: event.controlState?.owner,
      timestamp: event.controlState?.timestamp,
      updated: event.controlState?.updated
    };
    
    if (extendedControlState.owner === currentUserAddress) {
      extendedControlState.isCreator = true;
    }
    
    // Set ownerAddress for consistency
    extendedControlState.ownerAddress = extendedControlState.owner;
    
    // Parse the event description to extract embedded metadata
    if (typeof extendedControlState.description === 'string') {
      try {
        const descObj = JSON.parse(extendedControlState.description);
        if (descObj && typeof descObj === 'object') {
          extendedControlState.eventDate = descObj.eventDate;
          extendedControlState.location = descObj.location;
          extendedControlState.website = descObj.website;
          extendedControlState.contact = descObj.contact;
          extendedControlState.bannerImage = descObj.bannerImage;
        }
      } catch (e) {
        // Not valid JSON, leave as is
      }
    }
    
    // Log the raw event data
    console.log("Raw event control state:", event.controlState);
    console.log("Extended event data:", extendedControlState);
    
    // Get talks for this event and attach them to the extended control state
    const talks = await getTalks(eventId);
    extendedControlState.talks = talks;
    
    console.log(`Successfully retrieved event: ${extendedControlState.title}`);
    return extendedControlState;
  } catch (error) {
    console.error(`Failed to fetch event with ID ${eventId}:`, error);
    return null;
  }
};

export const getTalks = async (eventId: string): Promise<ExtendedTalk[]> => {
  try {
    console.log(`Fetching talks for event ${eventId}`);
    const qakulib = await getQakulib();
    
    // Make sure the QA is initialized
    if (!qakulib.qas.has(eventId)) {
      console.log(`Event ${eventId} not initialized yet, initializing...`);
      await qakulib.initQA(eventId);
    }
    
    const event = qakulib.qas.get(eventId);
    if (!event) {
      console.warn(`Event with ID ${eventId} not found when fetching talks`);
      return [];
    }
    
    const talksList = event.questions.values();
    const talks: ExtendedTalk[] = [];
    
    // Get current user address safely
    const currentUserAddress = qakulib.identity && 
                              qakulib.identity.address && 
                              typeof qakulib.identity.address === 'function' ? 
                              qakulib.identity.address() : '';
    
    console.log(`Current user address when fetching talks: ${currentUserAddress}`);
    
    for (const talk of talksList) {
      // Create an extended talk with our custom properties
      const extendedTalk: ExtendedTalk = {
        hash: talk.hash || talk.question || '', // Ensure hash is always present and required
        question: talk.question,
        upvoters: talk.upvoters,
        upvotes: talk.upvotes,
        upvotedByMe: talk.upvotedByMe,
        signer: talk.signer,
        timestamp: talk.timestamp
      };
      
      // Add voterAddresses property based on upvoters
      extendedTalk.voterAddresses = [];
      
      // Use upvoters for voter tracking
      if (extendedTalk.upvoters && Array.isArray(extendedTalk.upvoters)) {
        extendedTalk.voterAddresses = [...extendedTalk.upvoters];
      }
      
      // Check if the current user has upvoted this talk
      if (currentUserAddress && extendedTalk.upvotedByMe) {
        // Make sure the current user is in the voterAddresses array
        if (!extendedTalk.voterAddresses.includes(currentUserAddress)) {
          extendedTalk.voterAddresses.push(currentUserAddress);
        }
      }
      
      // Check if the current user is the author - compare with signer address
      if (currentUserAddress && extendedTalk.signer === currentUserAddress) {
        extendedTalk.isAuthor = true;
        console.log(`Found user's talk: ${extendedTalk.question}, signer: ${extendedTalk.signer}, current user: ${currentUserAddress}`);
      } else {
        console.log(`Talk by other user: ${extendedTalk.question}, signer: ${extendedTalk.signer}, current user: ${currentUserAddress}`);
      }
      
      // Add debug logging
      console.log(`Talk details: id=${extendedTalk.hash}, title=${extendedTalk.question || 'no-title'}, author status:`, 
                 extendedTalk.isAuthor ? 'YES' : 'NO',
                 'signer:', extendedTalk.signer);
      
      talks.push(extendedTalk);
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
  speaker: string,
  bio?: string
): Promise<string | null> => {
  try {
    console.log(`Submitting talk "${title}" by ${speaker}`);
    const qakulib = await getQakulib();
    
    // Make sure the QA is initialized
    if (!qakulib.qas.has(eventId)) {
      console.log(`Event ${eventId} not initialized yet, initializing...`);
      await qakulib.initQA(eventId);
    }
    
    // Format talk data for submission
    const talkData = JSON.stringify({title, description, speaker, bio});
    
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
    
    // Make sure the QA is initialized
    if (!qakulib.qas.has(eventId)) {
      console.log(`Event ${eventId} not initialized yet, initializing...`);
      await qakulib.initQA(eventId);
    }
    
    // Cast vote for the talk
    await qakulib.upvote(eventId, talkId);
    
    // Get the current user's wallet address
    const currentUserAddress = qakulib.identity?.address() || '';
    
    // If we have a wallet address, update our local state to track this vote
    if (currentUserAddress) {
      const event = qakulib.qas.get(eventId);
      if (event) {
        const talk = event.questions.get(talkId) as ExtendedTalk;
        if (talk) {
          // Initialize voterAddresses property if needed
          if (!talk.voterAddresses) {
            talk.voterAddresses = [];
          }
          
          // Add current user to voterAddresses if not already included
          if (!talk.voterAddresses.includes(currentUserAddress)) {
            talk.voterAddresses.push(currentUserAddress);
          }
        }
      }
    }
    
    console.log(`Vote recorded successfully for talk ${talkId}`);
    return true;
  } catch (error) {
    console.error("Failed to vote for talk:", error);
    return false;
  }
};
