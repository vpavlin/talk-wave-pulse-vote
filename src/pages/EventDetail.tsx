
import React from "react";
import { useParams } from "react-router-dom";
import { useEventDetail } from "@/hooks/useEventDetail";
import SubmitTalkDialog from "@/components/SubmitTalkDialog";
import AkashApiKeyDialog from "@/components/AkashApiKeyDialog";
import AcceptTalkDialog from "@/components/event-detail/AcceptTalkDialog";
import EventHeader from "@/components/event-detail/EventHeader";
import EventDetails from "@/components/event-detail/EventDetails";
import EventActions from "@/components/event-detail/EventActions";
import TalkFilters from "@/components/event-detail/TalkFilters";
import TalksList from "@/components/event-detail/TalksList";
import LoadingState from "@/components/event-detail/LoadingState";
import ErrorState from "@/components/event-detail/ErrorState";
import { getUserInfo } from "@/services/aiService";

const EventDetail = () => {
  const { eventId = "" } = useParams();
  const {
    event,
    isLoading,
    isError,
    sortOption,
    setSortOption,
    isSubmitTalkOpen,
    setIsSubmitTalkOpen,
    isApiKeyDialogOpen,
    setIsApiKeyDialogOpen,
    isAcceptTalkDialogOpen,
    setIsAcceptTalkDialogOpen,
    copied,
    suggestionData,
    isGeneratingSuggestion,
    connected,
    getSortedTalks,
    handleCloseEvent,
    handleGenerateSuggestion,
    handleSubmitTalk,
    handleCopyLink,
    handleShareTwitter,
    handleShareFarcaster,
    handleVote,
    handleAcceptTalk,
    handleAcceptTalkSubmit,
    formatEventDate,
    formatWalletAddress
  } = useEventDetail(eventId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !event) {
    return <ErrorState />;
  }

  const sortedTalks = getSortedTalks();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 to-indigo-950 transition-colors">
      <div className="container mx-auto px-4 py-8">
        <EventHeader 
          onCopyLink={handleCopyLink}
          onShareTwitter={handleShareTwitter}
          onShareFarcaster={handleShareFarcaster}
          copied={copied}
        />
        
        <EventDetails 
          event={event}
          formatEventDate={formatEventDate}
          formatWalletAddress={formatWalletAddress}
          onCloseEvent={handleCloseEvent}
        />
        
        <EventActions 
          isSubmitEnabled={event.enabled !== false}
          isWalletConnected={connected}
          onOpenSubmitDialog={() => setIsSubmitTalkOpen(true)}
          onGenerateSuggestion={handleGenerateSuggestion}
          isGeneratingSuggestion={isGeneratingSuggestion}
        />
        
        <TalkFilters 
          sortOption={sortOption}
          onSortChange={setSortOption}
          totalTalks={event.talks?.length || 0}
        />
        
        <TalksList 
          talks={sortedTalks}
          isCreator={event.isCreator || false}
          onVote={handleVote}
          onAcceptTalk={handleAcceptTalk}
        />
      </div>
      
      <SubmitTalkDialog 
        open={isSubmitTalkOpen}
        onOpenChange={setIsSubmitTalkOpen}
        onSubmit={handleSubmitTalk}
        initialData={{
          title: suggestionData?.title || "",
          description: suggestionData?.description || "",
          speaker: suggestionData?.speaker || getUserInfo().name || "",
          bio: suggestionData?.bio || getUserInfo().bio || ""
        }}
      />
      
      <AkashApiKeyDialog
        open={isApiKeyDialogOpen}
        onOpenChange={setIsApiKeyDialogOpen}
      />
      
      <AcceptTalkDialog
        open={isAcceptTalkDialogOpen}
        onOpenChange={setIsAcceptTalkDialogOpen}
        onAccept={handleAcceptTalkSubmit}
      />
    </div>
  );
};

export default EventDetail;
