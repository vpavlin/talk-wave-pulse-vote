
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from "@/contexts/WalletContext";

interface SubmitTalkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (talkData: { title: string; speaker: string; description: string }) => void;
}

const SubmitTalkDialog = ({ open, onOpenChange, onSubmit }: SubmitTalkDialogProps) => {
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { connected, connect } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected) {
      connect();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({ title, speaker, description });
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
          
          {!connected && (
            <Alert className="my-4 bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You'll need to connect your wallet to submit a talk.
              </AlertDescription>
            </Alert>
          )}
          
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
              <Label htmlFor="speaker" className="dark:text-gray-200">Speaker Name</Label>
              <Input
                id="speaker"
                placeholder="Your name"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                required
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description" className="dark:text-gray-200">Description</Label>
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
              {!connected ? "Connect Wallet" : isSubmitting ? "Submitting..." : "Submit Talk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitTalkDialog;
