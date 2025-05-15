
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { fetchEventById, closeEvent, Talk, Event, upvoteTalk, createTalk, acceptTalk } from '@/services/eventService';
import { useWallet } from '@/contexts/WalletContext';
import { generateTalkSuggestion, hasApiKey, getUserInfo } from '@/services/aiService';
import { format } from 'date-fns';

interface TalkSuggestion {
  title: string;
  description: string;
  speaker?: string;
  bio?: string;
}

export const useEventDetail = (eventId: string) => {
  const [sortOption, setSortOption] = useState("votes");
  const [isSubmitTalkOpen, setIsSubmitTalkOpen] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isAcceptTalkDialogOpen, setIsAcceptTalkDialogOpen] = useState(false);
  const [currentTalkId, setCurrentTalkId] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [suggestionData, setSuggestionData] = useState<TalkSuggestion | null>(null);
  
  const { toast } = useToast();
  const { connected, connect, usingExternalWallet } = useWallet();
  const queryClient = useQueryClient();
  
  const { 
    data: event, 
    refetch, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEventById(eventId),
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
    enabled: !!eventId,
  });

  useEffect(() => {
    const userInfo = getUserInfo();
    setSuggestionData(prevData => ({
      ...prevData,
      speaker: userInfo.name || "",
      bio: userInfo.bio || ""
    } as TalkSuggestion));
  }, []);

  useEffect(() => {
    if (event) {
      console.log("Event detail data loaded:", event);
      if (event.eventDate) {
        console.log("Event date:", new Date(event.eventDate));
      }
    }
  }, [event]);

  const handleCloseEvent = async () => {
    if (!event) return;
    
    try {
      const success = await closeEvent(event.id);
      if (success) {
        toast({
          title: "Event Updated",
          description: "Event has been closed for submissions",
        });
        
        queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      } else {
        toast({
          title: "Error",
          description: "Failed to close event",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleGenerateSuggestion = async () => {
    if (!event) return;
    
    if (!hasApiKey()) {
      setIsApiKeyDialogOpen(true);
      return;
    }
    
    setIsGeneratingSuggestion(true);
    
    try {
      const suggestionText = await generateTalkSuggestion(event.talks, event);
      
      let title = "";
      let description = "";
      
      const titleMatch = suggestionText.match(/(?:Title:|#)(.*?)(?:\n|$)/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
      }
      
      const descriptionMatch = suggestionText.match(/(?:Description:)(.*?)(?:\n|$)/i);
      if (descriptionMatch && descriptionMatch[1]) {
        description = descriptionMatch[1].trim();
      } else {
        const lines = suggestionText.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 1) {
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(title)) {
              description = lines.slice(i + 1).join(' ').trim();
              break;
            }
          }
        }
        
        if (!description && title) {
          description = suggestionText.substring(suggestionText.indexOf(title) + title.length).trim();
        }
      }
      
      if (!title) {
        const lines = suggestionText.split('\n').filter(line => line.trim() !== '');
        title = lines[0] || "AI Generated Talk";
      }
      
      if (!description) {
        description = suggestionText.replace(title, '').trim();
      }
      
      if (description.length > 200) {
        description = description.substring(0, 197) + "...";
      }
      
      const userInfo = getUserInfo();
      setSuggestionData({ 
        title, 
        description,
        speaker: userInfo.name || "",
        bio: userInfo.bio || ""
      });
      
      toast({
        title: "Suggestion Generated",
        description: "AI has created a talk suggestion based on event details",
      });
      
      setIsSubmitTalkOpen(true);
    } catch (error) {
      console.error('Error generating suggestion:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate a talk suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  const handleSubmitTalk = async (talkData: { title: string; speaker: string; description: string; bio?: string }) => {
    if (!event) return;
    
    try {
      const talkId = await createTalk(
        event.id, 
        talkData.title, 
        talkData.description, 
        talkData.speaker,
        talkData.bio,
        usingExternalWallet
      );
      
      if (talkId) {
        toast({
          title: "Talk Submitted",
          description: "Your lightning talk has been submitted successfully",
        });
        
        setIsSubmitTalkOpen(false);
        setSuggestionData(null);
        
        queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit talk",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        toast({
          title: "Link Copied",
          description: "Event link has been copied to clipboard",
        });
        
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Could not copy the link to clipboard",
          variant: "destructive",
        });
      });
  };

  const handleShareTwitter = () => {
    if (!event) return;
    
    const title = encodeURIComponent(`Check out "${event.title}" on Lightning Talk Wave`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, '_blank');
  };

  const handleShareFarcaster = () => {
    if (!event) return;
    
    const title = encodeURIComponent(`Check out "${event.title}" on Lightning Talk Wave`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://warpcast.com/~/compose?text=${title}&embeds[]=${url}`, '_blank');
  };

  const handleVote = async (talkId: string) => {
    if (!event) return;
    
    if (!connected) {
      connect();
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to vote",
      });
      return;
    }
    
    try {
      const success = await upvoteTalk(event.id, talkId);
      if (success) {
        toast({
          title: "Vote Recorded",
          description: "Your vote has been counted",
        });
        
        queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      } else {
        toast({
          title: "Error",
          description: "Failed to record vote",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleAcceptTalk = async (talkId: string) => {
    if (!event) return;
    
    if (!event.isCreator) {
      toast({
        title: "Permission Denied",
        description: "Only the event creator can accept talks",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentTalkId(talkId);
    setIsAcceptTalkDialogOpen(true);
  };

  const handleAcceptTalkSubmit = async (feedback: string) => {
    if (!event || !currentTalkId) return;
    
    try {
      const success = await acceptTalk(event.id, currentTalkId, feedback);
      if (success) {
        toast({
          title: "Talk Accepted",
          description: "The talk has been accepted successfully",
        });
        
        queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      } else {
        toast({
          title: "Error",
          description: "Failed to accept talk",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const getSortedTalks = () => {
    if (!event || !event.talks) return [];
    
    const sortedTalks = [...event.talks];
    
    switch (sortOption) {
      case "votes":
        return sortedTalks.sort((a, b) => b.votes - a.votes);
      case "time":
        return sortedTalks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "random":
        return sortedTalks.sort(() => Math.random() - 0.5);
      default:
        return sortedTalks;
    }
  };

  const formatWalletAddress = (address: string | undefined) => {
    if (!address) return "Unknown";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatEventDate = (dateString: string | undefined) => {
    if (!dateString) return "Date TBD";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return "Date TBD";
      }
      return format(date, "MMMM d, yyyy");
    } catch (err) {
      console.error("Error formatting date:", err, dateString);
      return "Date TBD";
    }
  };

  const renderWebsiteLink = (website: string) => {
    const formattedUrl = website.startsWith('http') ? website : `https://${website}`;
    return (
      <a 
        href={formattedUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-purple-600 dark:text-purple-400 hover:underline break-all"
      >
        {website}
      </a>
    );
  };

  return {
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
    currentTalkId,
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
    formatWalletAddress,
    formatEventDate,
    renderWebsiteLink
  };
};
