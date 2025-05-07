
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getUserInfo } from "@/services/aiService";
import { useWallet } from "@/contexts/WalletContext";

interface SubmitTalkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (talkData: { title: string; speaker: string; description: string; bio?: string; useExternalWallet: boolean }) => void;
  initialData?: { title: string; description: string; speaker?: string; bio?: string } | null;
}

const SubmitTalkDialog = ({ open, onOpenChange, onSubmit, initialData }: SubmitTalkDialogProps) => {
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [description, setDescription] = useState("");
  const [bio, setBio] = useState("");
  const [useEnsName, setUseEnsName] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { ensName, connected, usingExternalWallet } = useWallet();

  // Update form fields when initialData changes or when dialog opens
  useEffect(() => {
    if (open) {
      // Get user info when dialog opens
      const userInfo = getUserInfo();
      
      // Use ENS name if available and enabled, otherwise use stored name
      const defaultSpeakerName = useEnsName && ensName ? ensName : userInfo.name || "";
      
      if (initialData) {
        setTitle(initialData.title || "");
        setDescription(initialData.description || "");
        setSpeaker(initialData.speaker || defaultSpeakerName);
        setBio(initialData.bio || userInfo.bio || "");
      } else {
        // If no initialData, just use the user info from localStorage or ENS
        setSpeaker(defaultSpeakerName);
        setBio(userInfo.bio || "");
      }
    }
  }, [initialData, open, ensName, useEnsName]);

  // When ENS name toggle changes, update speaker name accordingly
  useEffect(() => {
    if (useEnsName && ensName && connected) {
      setSpeaker(ensName);
    } else if (!useEnsName) {
      // If not using ENS, revert to stored user info
      const userInfo = getUserInfo();
      setSpeaker(userInfo.name || "");
    }
  }, [useEnsName, ensName, connected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({ 
        title, 
        speaker, 
        description, 
        bio, 
        useExternalWallet: usingExternalWallet 
      });
    } catch (error) {
      console.error("Error submitting talk:", error);
    } finally {
      resetForm();
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSpeaker("");
    setDescription("");
    setBio("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-white">Submit a Lightning Talk</DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Share your knowledge with the community! Lightning talks are 5-10 minute presentations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="dark:text-gray-200">Talk Title</Label>
              <Input
                id="title"
                placeholder="e.g., Modern React Patterns"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="speaker" className="dark:text-gray-200">Speaker Name</Label>
                {ensName && usingExternalWallet && (
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="use-ens" 
                      checked={useEnsName} 
                      onCheckedChange={setUseEnsName} 
                    />
                    <Label htmlFor="use-ens" className="text-sm dark:text-gray-300">
                      Use ENS name
                    </Label>
                  </div>
                )}
              </div>
              <Input
                id="speaker"
                placeholder="Your name"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                required
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={useEnsName && !!ensName}
              />
              {useEnsName && ensName && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Using your ENS name
                </p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="bio" className="dark:text-gray-200">Speaker Bio</Label>
              <Textarea
                id="bio"
                placeholder="Brief professional bio (max 150 characters)"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={150}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {bio.length}/150
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description" className="dark:text-gray-200">Talk Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your lightning talk (max 200 characters)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                required
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {description.length}/200
              </p>
            </div>

            {usingExternalWallet && (
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-md">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  Your talk will be published using your connected wallet address.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
            >
              {isSubmitting ? "Submitting..." : "Submit Talk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitTalkDialog;
