import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InsertProfile, Profile, insertProfileSchema } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

// Extend the schema with validation rules
const formSchema = insertProfileSchema.extend({
  profileId: z.string().min(3, { message: "ID must be at least 3 characters" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  searchId: z.string().optional(),
  photoUrl: z.string().optional(),
});

interface ProfileModalProps {
  isOpen: boolean;
  profile: Profile | null;
  handleClose: () => void;
  handleSubmit: (data: InsertProfile) => Promise<void>;
}

export default function ProfileModal({ isOpen, profile, handleClose, handleSubmit }: ProfileModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileId: "",
      name: "",
      description: "",
      searchId: "",
      photoUrl: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        profileId: profile.profileId,
        name: profile.name,
        description: profile.description,
        searchId: profile.searchId || "",
        photoUrl: profile.photoUrl || "",
      });
    } else {
      form.reset({
        profileId: "",
        name: "",
        description: "",
        searchId: "",
        photoUrl: "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await handleSubmit(data);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{profile ? "Edit Profile" : "Add New Profile"}</DialogTitle>
          <DialogDescription>
            Fill in the information below to {profile ? "update the" : "create a new"} profile.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profileId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="searchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search ID (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex rounded-md">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                        #
                      </span>
                      <Input {...field} className="rounded-l-none" />
                    </div>
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
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo (Optional)</FormLabel>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={field.value} />
                      <AvatarFallback>{getInitials(form.watch("name"))}</AvatarFallback>
                    </Avatar>
                    <FormControl>
                      <Input {...field} placeholder="Enter photo URL" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
