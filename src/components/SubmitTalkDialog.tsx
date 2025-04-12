
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isWalletConnected) {
      setIsWalletConnected(true);
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate submission delay
    setTimeout(() => {
      onSubmit({ title, speaker, description });
      resetForm();
      setIsSubmitting(false);
    }, 500);
  };

  const resetForm = () => {
    setTitle("");
    setSpeaker("");
    setDescription("");
    setIsWalletConnected(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Submit a Lightning Talk</DialogTitle>
            <DialogDescription>
              Share your knowledge with the community! Lightning talks are 5-10 minute presentations.
            </DialogDescription>
          </DialogHeader>
          
          {!isWalletConnected && (
            <Alert className="my-4 bg-amber-50 text-amber-800 border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You'll need to connect your wallet to submit a talk.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Talk Title</Label>
              <Input
                id="title"
                placeholder="e.g., Modern React Patterns"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="speaker">Speaker Name</Label>
              <Input
                id="speaker"
                placeholder="Your name"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your lightning talk (max 200 characters)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                required
              />
              <p className="text-xs text-gray-500 text-right">
                {description.length}/200
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {!isWalletConnected ? "Connect Wallet" : isSubmitting ? "Submitting..." : "Submit Talk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitTalkDialog;
