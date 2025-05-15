
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Talk } from "@/services/eventService";
import TalkCard from "@/components/TalkCard";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TalksListProps {
  talks: Talk[];
  isCreator: boolean;
  onVote: (talkId: string) => void;
  onAcceptTalk: (talkId: string) => void;
}

const TalksList = ({ talks, isCreator, onVote, onAcceptTalk }: TalksListProps) => {
  const renderTalkCard = (talk: Talk) => {
    return (
      <TalkCard 
        key={talk.id} 
        talk={talk} 
        onVote={() => onVote(talk.id)}
        renderActions={isCreator && !talk.answer ? (
          <Button 
            size="sm" 
            onClick={() => onAcceptTalk(talk.id)}
            className="bg-green-600 hover:bg-green-700 text-white mt-2"
          >
            <CheckCheck className="mr-2 h-4 w-4" /> Accept Talk
          </Button>
        ) : null}
      />
    );
  };

  return (
    <Tabs defaultValue="all" className="mb-8">
      <TabsList className="bg-purple-100/70 dark:bg-purple-900/40 p-1">
        <TabsTrigger 
          value="all" 
          className="text-lg data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800 dark:data-[state=active]:bg-purple-800 dark:data-[state=active]:text-purple-100 focus-ring"
        >
          All Talks
        </TabsTrigger>
        <TabsTrigger 
          value="top" 
          className="text-lg data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800 dark:data-[state=active]:bg-purple-800 dark:data-[state=active]:text-purple-100 focus-ring"
        >
          Top Rated
        </TabsTrigger>
        <TabsTrigger 
          value="accepted" 
          className="text-lg data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800 dark:data-[state=active]:bg-purple-800 dark:data-[state=active]:text-purple-100 focus-ring"
        >
          Accepted
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {talks.map(talk => renderTalkCard(talk))}
          {talks.length === 0 && (
            <p className="text-lg text-gray-500 dark:text-gray-400 col-span-2 text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              No talks have been submitted yet. Be the first to submit a talk!
            </p>
          )}
        </div>
      </TabsContent>
      <TabsContent value="top" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {talks
            .filter(talk => talk.votes >= 10)
            .map(talk => renderTalkCard(talk))
          }
          {talks.filter(talk => talk.votes >= 10).length === 0 && (
            <p className="text-lg text-gray-500 dark:text-gray-400 col-span-2 text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              No talks have received 10 or more votes yet.
            </p>
          )}
        </div>
      </TabsContent>
      <TabsContent value="accepted" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {talks
            .filter(talk => talk.answer)
            .map(talk => renderTalkCard(talk))
          }
          {talks.filter(talk => talk.answer).length === 0 && (
            <p className="text-lg text-gray-500 dark:text-gray-400 col-span-2 text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              No talks have been accepted yet.
            </p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default TalksList;
