
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { BellRing } from "lucide-react";

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
    announce?: boolean;
  }) => void;
}

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  location: z.string().optional(),
  contact: z.string().optional(),
  bannerImage: z.string().url("Must be a valid image URL").optional().or(z.literal('')),
  announce: z.boolean().default(true)
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
      bannerImage: "",
      announce: true
    }
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    console.log("Form submitted with values:", values);
    
    try {
      await onSubmit({
        title: values.title,
        description: values.description,
        date: values.date,
        website: values.website || "",
        location: values.location || "",
        contact: values.contact || "",
        bannerImage: values.bannerImage || "",
        announce: values.announce
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
                    <FormMessage />
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
                    <FormMessage />
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
                    <FormMessage />
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
                    <FormMessage />
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
                    <FormMessage />
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
                    <FormMessage />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="announce"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm border-gray-200 dark:border-gray-700">
                    <div className="space-y-0.5">
                      <FormLabel className="dark:text-gray-200">
                        <div className="flex items-center">
                          <BellRing className="h-4 w-4 mr-2 text-cyan-500" />
                          Announce Event
                        </div>
                      </FormLabel>
                      <FormDescription className="dark:text-gray-400">
                        Make this event visible to all users on the announcement channel
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
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
