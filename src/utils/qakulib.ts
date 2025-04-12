
// Using the locally installed qakulib package
import {Qaku} from "qakulib";
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

export const getQakulib = async () => {
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

export const connectWallet = async (): Promise<string | null> => {
  try {
    const qakulib = await getQakulib();
    const address = await qakulib.connectWallet();
    return address;
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    return null;
  }
};

export const isWalletConnected = async (): Promise<boolean> => {
  try {
    const qakulib = await getQakulib();
    return await qakulib.isWalletConnected();
  } catch (error) {
    console.error("Failed to check wallet connection:", error);
    return false;
  }
};

export const getCurrentWalletAddress = async (): Promise<string | null> => {
  try {
    const qakulib = await getQakulib();
    return await qakulib.getCurrentWalletAddress();
  } catch (error) {
    console.error("Failed to get current wallet address:", error);
    return null;
  }
};

export const disconnectWallet = async (): Promise<void> => {
  try {
    const qakulib = await getQakulib();
    await qakulib.disconnectWallet();
  } catch (error) {
    console.error("Failed to disconnect wallet:", error);
  }
};

export const getEvents = async (): Promise<any[]> => {
  try {
    const qakulib = await getQakulib();
    const events = await qakulib.getQAs();
    return events;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
};

export const getEventById = async (eventId: string): Promise<any | null> => {
  try {
    const qakulib = await getQakulib();
    const event = await qakulib.getQA(eventId);
    return event;
  } catch (error) {
    console.error(`Failed to fetch event with ID ${eventId}:`, error);
    return null;
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
    const talkId = await qakulib.newAnswer(eventId, title, description, speaker);
    return talkId;
  } catch (error) {
    console.error("Failed to submit talk:", error);
    return null;
  }
};

export const voteTalk = async (eventId: string, talkId: string): Promise<boolean> => {
  try {
    const qakulib = await getQakulib();
    await qakulib.vote(eventId, talkId);
    return true;
  } catch (error) {
    console.error("Failed to vote for talk:", error);
    return false;
  }
};
