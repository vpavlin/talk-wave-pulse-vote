
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink } from 'lucide-react';
import { saveApiKey, getApiKey } from '@/services/aiService';

interface AkashApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AkashApiKeyDialog = ({ open, onOpenChange }: AkashApiKeyDialogProps) => {
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  // Load the API key when the dialog opens
  useEffect(() => {
    if (open) {
      const savedKey = getApiKey();
      if (savedKey) {
        setApiKey(savedKey);
      }
    }
  }, [open]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Akash API key",
        variant: "destructive",
      });
      return;
    }

    // Save the API key
    saveApiKey(apiKey.trim());
    
    toast({
      title: "API Key Saved",
      description: "Your Akash API key has been saved successfully",
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold dark:text-white">Akash Network API Key</DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            Enter your Akash Network API key to enable AI-powered talk suggestions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="apiKey" className="dark:text-gray-200">API Key</Label>
            <a 
              href="https://chatapi.akash.network/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs flex items-center text-purple-500 hover:underline"
            >
              Get your free API key <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
          <Input
            id="apiKey"
            placeholder="sk-xxxxxxxxxxxxxxxx"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your API key is stored locally in your browser and is never sent to our servers.
          </p>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
          >
            Save API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AkashApiKeyDialog;
