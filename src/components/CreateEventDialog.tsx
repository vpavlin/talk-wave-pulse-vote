
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (eventData: { 
    title: string; 
    description: string; 
    date: string;
    website?: string;
    location?: string;
    contact?: string;
    bannerImage?: string;
  }) => void;
}

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  location: z.string().optional(),
  contact: z.string().optional(),
  bannerImage: z.string().url("Must be a valid image URL").optional().or(z.literal(''))
});

const CreateEventDialog = ({ open, onOpenChange, onSubmit }: CreateEventDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      website: "",
      location: "",
      contact: "",
      bannerImage: ""
    }
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        title: values.title,
        description: values.description,
        date: values.date,
        website: values.website,
        location: values.location,
        contact: values.contact,
        bannerImage: values.bannerImage
      });
      form.reset();
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] dark:bg-gray-800 dark:border-gray-700">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold dark:text-white">Create New Event</DialogTitle>
              <DialogDescription className="dark:text-gray-300">
                Fill out the form below to create a new event for lightning talk submissions.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">Event Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., React Conference 2025"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the event"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">Event Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">Website (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="dark:text-gray-400">
                      Event website or registration link
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">Location (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="City, Country or Online"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">Contact (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email or phone number"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bannerImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">Banner Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="dark:text-gray-400">
                      URL to an image that will be displayed as the event banner
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
              >
                {isSubmitting ? "Creating..." : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
