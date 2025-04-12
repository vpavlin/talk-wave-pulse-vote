
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

export const getQakulib = async ():Promise<Qaku> => {
  if (!qakulibInstance) {
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
  }
  return qakulibInstance;
};

export const publishEvent = async (title:string, desc:string, moderation:boolean):Promise<string> => {
  const qakulib = await getQakulib();
  const eventId = await qakulib.newQA(title, desc, true, [], moderation)
  return eventId
}

export const getEvents = async (): Promise<any[]> => {
  try {
    const qakulib = await getQakulib();
    const eventsList = qakulib.qas.values();
    const events = []
    for (const event of eventsList) {
      events.push(event.controlState);
    }
    return events;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
};

export const getEventById = async (eventId: string): Promise<any | null> => {
  try {
    const qakulib = await getQakulib();
    const event = qakulib.qas.get(eventId);
    return event.controlState;
  } catch (error) {
    console.error(`Failed to fetch event with ID ${eventId}:`, error);
    return null;
  }
};

export const getTalks = async (eventId: string): Promise<EnhancedQuestionMessage[]> => {
  try {
    const qakulib = await getQakulib();
    const talksList = qakulib.qas.get(eventId)?.questions.values();
    const talks = []
    for (const talk of talksList) {
      talks.push(talk);
    }
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
    const qakulib = await getQakulib();
    const talkId = await qakulib.newQuestion(eventId, JSON.stringify({title, description, speaker}));
    return talkId;
  } catch (error) {
    console.error("Failed to submit talk:", error);
    return null;
  }
};

export const voteTalk = async (eventId: string, talkId: string): Promise<boolean> => {
  try {
    const qakulib = await getQakulib();
    await qakulib.upvote(eventId, talkId);
    return true;
  } catch (error) {
    console.error("Failed to vote for talk:", error);
    return false;
  }
};
