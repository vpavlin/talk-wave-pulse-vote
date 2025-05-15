
import React, { useState } from "react";
import { CheckCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AcceptTalkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: (feedback: string) => void;
}

const AcceptTalkDialog = ({ open, onOpenChange, onAccept }: AcceptTalkDialogProps) => {
  const [feedback, setFeedback] = useState("");
  
  const handleSubmit = () => {
    onAccept(feedback);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-purple-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-200">Accept This Talk</DialogTitle>
          <DialogDescription className="text-gray-300">
            Add optional feedback for the speaker. This will be visible to them.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Congratulations! Your talk has been accepted."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
            />
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white">
            <CheckCheck className="mr-2 h-4 w-4" />
            Accept Talk
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AcceptTalkDialog;
