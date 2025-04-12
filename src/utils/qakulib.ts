
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