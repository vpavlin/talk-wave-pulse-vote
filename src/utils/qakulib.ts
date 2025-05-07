// Using the locally installed qakulib package
import {ControlMessage, EnhancedQuestionMessage, HistoryTypes, Qaku, UpvoteType} from "qakulib";
import { wakuPeerExchangeDiscovery } from "@waku/discovery";
import { derivePubsubTopicsFromNetworkConfig } from "@waku/utils"
import { createLightNode, IWaku, LightNode, Protocols } from '@waku/sdk';
import { createDecoder, createEncoder, DecodedMessage } from '@waku/sdk';
import { Dispatcher, DispatchMetadata, Signer, Store } from "waku-dispatcher";
import { JsonRpcSigner } from "ethers";

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
  answer?: string; // Add answer property to track if a talk has been accepted
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
  timestamp?:number;
  updated?: number;
  enabled?: boolean; // Add enabled property to track if event is open/closed
  announced?: boolean;
  questionsCount?: number; // Add count of questions from history
}

// Initialize the Qakulib instance
let qakulibInstance: Qaku | null = null;

let announceDispatcher: Dispatcher | null = null;
// Export the announcedEvents array so it can be used in eventService.ts
export const announcedEvents: ExtendedControlMessage[] = []

// Define the common content topic for event announcements
const ANNOUNCE_CONTENT_TOPIC = "/lightningtalkwave/1/announce/json";

// Define the localStorage key for hidden events
const HIDDEN_EVENTS_KEY = "lightning-talk-hidden-events";

const bootstrapNodes: string[] = [
  "/dns4/waku-test.bloxy.one/tcp/8095/wss/p2p/16Uiu2HAmSZbDB7CusdRhgkD81VssRjQV5ZH13FbzCGcdnbbh6VwZ",
  "/dns4/node-01.do-ams3.waku.sandbox.status.im/tcp/8000/wss/p2p/16Uiu2HAmNaeL4p3WEYzC9mgXBmBWSgWjPHRvatZTXnp8Jgv3iKsb",
]

const networkConfig =  {clusterId: 42, shards: [0]}

// Event handlers for qakulib events
let eventListeners: any[] = [];

// Event announcement listeners
let announceEventListeners: any[] = [];

let initializing = false
let initPromise: Promise<Qaku>;

export const getQakulib = async (externalWalletSigner?: JsonRpcSigner):Promise<Qaku> => {
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
        // Fix type error by using type assertion for the peer discovery
        libp2p: {
          peerDiscovery: [
            wakuPeerExchangeDiscovery(derivePubsubTopicsFromNetworkConfig(networkConfig)) as any
          ]
        }, });
      await node.start();
      
      // Wait for connection to at least one peer
      await node.waitForPeers([Protocols.Store, Protocols.Filter, Protocols.LightPush]);
      
      qakulibInstance = new Qaku(node as LightNode);
      
      // Pass the external wallet signer if provided
      await qakulibInstance.init("http://localhost:8080", "https://api.qaku.app", externalWalletSigner);

      // Set up announcement message listener
      await setupAnnouncement(node);

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

// Set up listener for event announcements
const setupAnnouncement = async (node: IWaku) => {
  if (announceDispatcher) return
  try {
    console.log(`Setting up listener for announcement topic: ${ANNOUNCE_CONTENT_TOPIC}`);

    const disp = new Dispatcher(node as LightNode, ANNOUNCE_CONTENT_TOPIC, false, new Store("lightningtalk-announce"))
    disp.on("NEW_EVENT", (payload:ExtendedControlMessage, signer:Signer, meta:DispatchMetadata) => {
      if (announcedEvents.findIndex(e => e.id == payload.id) >= 0) throw new Error("Event already exists")
      announcedEvents.push(payload)
      
    }, true)
    await disp.start()
    announceDispatcher = disp
    try {
      await node.waitForPeers([Protocols.Store]);

      console.log("Dispatching local query")
      await disp.dispatchLocalQuery() 

      if (announcedEvents.length == 0) {
          console.log("Dispatching general query")
          await disp.dispatchQuery()
      }
    } catch (e) {
        console.error("Failed to initialized announce protocol:", e)
        throw e
    }

  } catch (error) {
    console.error('Error setting up announcement listener:', error);
  }
};

// Function to announce an event to the common topic
export const announceEvent = async (event: ExtendedControlMessage) => {
  if (!announceDispatcher) throw new Error("Dispatcher not initialized")
  try {
    console.log(`Announcing event to common topic: ${ANNOUNCE_CONTENT_TOPIC}`);

    const qakulib = await getQakulib()
    
    
    const result = announceDispatcher.emit("NEW_EVENT", event, qakulib.identity!.getWallet())
    if (!result) throw new Error("Failed ot announce new event")
    
    console.log('Event announcement sent successfully');
    return true;
  } catch (error) {
    console.error('Error announcing event:', error);
    return false;
  }
};

// Helper function to check if an event is hidden by the user
const isEventHidden = (eventId: string): boolean => {
  try {
    const hiddenEventsJSON = localStorage.getItem(HIDDEN_EVENTS_KEY);
    if (!hiddenEventsJSON) return false;
    
    const hiddenEvents = JSON.parse(hiddenEventsJSON);
    return Array.isArray(hiddenEvents) && hiddenEvents.includes(eventId);
  } catch (error) {
    console.error("Error checking if event is hidden:", error);
    return false;
  }
};

// Load history and initialize QA events from history, skipping hidden and closed events
const loadHistoryAndInitializeQAs = async (qakulib: Qaku) => {
  try {
    console.log("Loading QA events from history");
    
    // Use the getAll method from the history object to retrieve all known QAs
    const knownQAs = qakulib.history.getAll ? qakulib.history.getAll() : [];
    
    console.log(`Found ${knownQAs.length} QA events in history`);
    
    // Initialize each QA event from history to ensure proper subscription
    for (const qaEvent of knownQAs) {
      // Extract the QA ID from the history entry
      const qaId = qaEvent.id;
      
      // Skip initialization if the event is hidden by the user
      if (isEventHidden(qaId)) {
        console.log(`Skipping initialization for hidden event: ${qaId}`);
        continue;
      }
      
      // Skip initialization if the event is closed (not active)
      if (qaEvent.isActive === false) {
        console.log(`Skipping initialization for closed event: ${qaId}`);
        continue;
      }
      
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
  
  // Announce the event to the common topic for discovery
  const eventData: ExtendedControlMessage = {
    id: eventId,
    title: title,
    description: desc,
    owner: qakulib.identity?.address ? qakulib.identity.address() : '',
    timestamp: Date.now()
  };
  
  // If description is JSON, try to parse and extract metadata
  if (typeof desc === 'string') {
    try {
      const descObj = JSON.parse(desc);
      if (descObj && typeof descObj === 'object') {
        eventData.eventDate = descObj.eventDate;
        eventData.location = descObj.location;
        eventData.website = descObj.website;
        eventData.contact = descObj.contact;
        eventData.bannerImage = descObj.bannerImage;
      }
    } catch (e) {
      // Not valid JSON, leave as is
    }
  }
  
  return eventId;
}

export const getEvents = async (): Promise<ExtendedControlMessage[]> => {
  try {
    console.log("Fetching all events from qakulib");
    const qakulib = await getQakulib();
    
    // Get current user address for comparison - handle safely
    const currentUserAddress = qakulib.identity && 
                              qakulib.identity.address && 
                              typeof qakulib.identity.address === 'function' ? 
                              qakulib.identity.address() : '';
    
    // Get active events from qakulib.qas (already initialized)
    const activeEventsList = qakulib.qas.values();
    const activeEvents: ExtendedControlMessage[] = [];
    
    for (const event of activeEventsList) {
      // Ensure we have an ID to use
      const eventId = event.controlState?.id || (event as any).id || '';
      
      // Create extended control state with additional properties
      const extendedEvent: ExtendedControlMessage = {
        id: eventId, // Ensure id is always present and required
        title: event.controlState?.title,
        description: event.controlState?.description,
        owner: event.controlState?.owner,
        timestamp: event.controlState?.timestamp,
        updated: event.controlState?.updated,
        enabled: event.controlState?.enabled !== false // Default to true if not explicitly set to false
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
      
      activeEvents.push(extendedEvent);
    }
    
    // Now get all events from history, including closed ones
    const historyEvents = qakulib.history.getAll ? qakulib.history.getAll() : [];
    const closedEvents: ExtendedControlMessage[] = [];
    
    // Process history events to extract closed events
    for (const historyEvent of historyEvents) {
      // Skip if this event is already in the active events list
      if (activeEvents.some(event => event.id === historyEvent.id)) {
        continue;
      }
      
      // Create extended control message from history entry
      const extendedEvent: ExtendedControlMessage = {
        id: historyEvent.id,
        title: historyEvent.title,
        description: historyEvent.description,
        timestamp: historyEvent.createdAt,
        enabled: historyEvent.isActive,
        questionsCount: historyEvent.questionsCnt || 0 // Include question count from history
      };
      
      // Check if the current user is the creator of this event
      if (historyEvent.type === HistoryTypes.CREATED) {
        extendedEvent.isCreator = true;
      }
      
      // Parse description for metadata
      if (typeof extendedEvent.description === 'string') {
        try {
          const descObj = JSON.parse(extendedEvent.description);
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
      
      closedEvents.push(extendedEvent);
    }
    
    // Combine active and closed events
    const combinedEvents = [...activeEvents, ...closedEvents];
    
    console.log(`Found ${combinedEvents.length} events (${activeEvents.length} active, ${closedEvents.length} closed)`);
    return combinedEvents;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
};

export const getEventById = async (eventId: string): Promise<ExtendedControlMessage | null> => {
  try {
    console.log(`Fetching event with ID ${eventId}`);
    const qakulib = await getQakulib();
    
    // Check if the event is hidden by the user
    const isHidden = isEventHidden(eventId);
    
    // First check if this is a closed event in history
    const historyEvents = qakulib.history.getAll ? qakulib.history.getAll() : [];
    const historyEvent = historyEvents.find(event => event.id === eventId);
    
    if (historyEvent && (isHidden || historyEvent.isActive === false)) {
      console.log(`Found closed or hidden event ${eventId} in history, using history data`);
      
      // Create an ExtendedControlMessage with required id property
      const extendedControlState: ExtendedControlMessage = {
        id: eventId,
        title: historyEvent.title,
        description: historyEvent.description,
        timestamp: historyEvent.createdAt,
        enabled: historyEvent.isActive,
        questionsCount: historyEvent.questionsCnt || 0
      };
      
      // Check if this is a created event by the user
      if (historyEvent.type === HistoryTypes.CREATED) {
        extendedControlState.isCreator = true;
      }
      
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
      
      // For closed or hidden events, we don't load talks
      extendedControlState.talks = [];
      
      console.log(`Successfully retrieved closed/hidden event from history: ${extendedControlState.title}`);
      return extendedControlState;
    }
    
    // If it's not a closed event or it's not found in history, proceed with normal initialization
    if (!qakulib.qas.has(eventId) && !isHidden) {
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
      updated: event.controlState?.updated,
      enabled: event.controlState?.enabled // Default to true if not explicitly set to false
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
    
    // Get talks for this event and attach them to the extended control state
    if (!isHidden) {
      const talks = await getTalks(eventId);
      extendedControlState.talks = talks;
    } else {
      extendedControlState.talks = [];
    }
    
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
        hash: talk.hash || talk.content || '', // Ensure hash is always present and required
        question: talk.content,
        upvoters: talk.upvoters,
        upvotes: talk.upvotes,
        upvotedByMe: talk.upvotedByMe,
        signer: talk.signer,
        timestamp: talk.timestamp,
        answer: talk.answers.length > 0 && talk.answers[0].content // Include answer field to track accepted talks
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
                 'signer:', extendedTalk.signer,
                 'answer:', extendedTalk.answer ? 'YES' : 'NO');
      
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
    await qakulib.upvote(eventId, talkId, UpvoteType.QUESTION);
    
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

export const closeEvent = async (eventId: string): Promise<boolean> => {
  try {
    console.log(`Closing event with ID ${eventId}`);
    const qakulib = await getQakulib();
    
    // Make sure the QA is initialized
    if (!qakulib.qas.has(eventId)) {
      console.log(`Event ${eventId} not initialized yet, initializing...`);
      await qakulib.initQA(eventId);
    }
    
    // Use the QA switch state function to close the event (false = closed)
    await qakulib.switchQAState(eventId, false);
    
    console.log(`Event ${eventId} closed successfully`);
    return true;
  } catch (error) {
    console.error(`Failed to close event with ID ${eventId}:`, error);
    return false;
  }
};

// Add new function to accept a talk
export const acceptTalk = async (eventId: string, talkId: string, feedback?: string): Promise<boolean> => {
  try {
    console.log(`Accepting talk ${talkId} in event ${eventId}`);
    const qakulib = await getQakulib();
    
    // Make sure the QA is initialized
    if (!qakulib.qas.has(eventId)) {
      console.log(`Event ${eventId} not initialized yet, initializing...`);
      await qakulib.initQA(eventId);
    }
    
    // Use the answer method to accept the talk
    await qakulib.answer(eventId, talkId, false, feedback || "Talk accepted");
    
    console.log(`Talk ${talkId} accepted successfully`);
    return true;
  } catch (error) {
    console.error("Failed to accept talk:", error);
    return false;
  }
};
