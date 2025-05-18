import { useState, useEffect } from "react";
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
import { 
  InsertProfile, 
  Profile, 
  insertProfileSchema, 
  Document,
  documentSchema 
} from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import FileUpload from "./FileUpload";
import DocumentList from "./DocumentList";
import { nanoid } from "nanoid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Extend the schema with validation rules
const formSchema = insertProfileSchema.extend({
  profileId: z.string().min(3, { message: "ID must be at least 3 characters" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  searchId: z.string().optional(),
  photoUrl: z.string().optional(),
  documents: z.array(documentSchema).optional().default([]),
});

interface ProfileModalProps {
  isOpen: boolean;
  profile: Profile | null;
  handleClose: () => void;
  handleSubmit: (data: InsertProfile) => Promise<void>;
}

export default function ProfileModal({ isOpen, profile, handleClose, handleSubmit }: ProfileModalProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [documents, setDocuments] = useState<Document[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileId: "",
      name: "",
      description: "",
      searchId: "",
      photoUrl: "",
      documents: [],
    },
  });

  useEffect(() => {
    if (profile) {
      // Set form values
      form.reset({
        profileId: profile.profileId,
        name: profile.name,
        description: profile.description,
        searchId: profile.searchId || "",
        photoUrl: profile.photoUrl || "",
        documents: Array.isArray(profile.documents) ? profile.documents : [],
      });
      
      // Set documents
      setDocuments(Array.isArray(profile.documents) ? profile.documents : []);
      
      // Reset file states
      setPhotoFile(null);
    } else {
      // Reset all states for a new profile
      form.reset({
        profileId: "",
        name: "",
        description: "",
        searchId: "",
        photoUrl: "",
        documents: [],
      });
      setPhotoFile(null);
      setDocuments([]);
    }
    
    // Reset to first tab when opening
    setActiveTab("basic");
  }, [profile, form, isOpen]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // If we have a file upload, handle it
      // In a real app, you'd upload the file to a server and get a URL back
      if (photoFile) {
        // For demo, we'll use a blob URL
        const photoUrl = URL.createObjectURL(photoFile);
        data.photoUrl = photoUrl;
        
        toast({
          title: "Photo uploaded",
          description: "Photo will be available as long as the app is running.",
        });
      }
      
      // Add the documents
      data.documents = documents;
      
      await handleSubmit(data);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePhotoChange = (value: File | string | null) => {
    if (value instanceof File) {
      setPhotoFile(value);
      // Clear the URL field since we're using a file
      form.setValue("photoUrl", "");
    } else if (typeof value === "string") {
      setPhotoFile(null);
      form.setValue("photoUrl", value);
    } else {
      setPhotoFile(null);
      form.setValue("photoUrl", "");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{profile ? "Edit Profile" : "Add New Profile"}</DialogTitle>
          <DialogDescription>
            Fill in the information below to {profile ? "update the" : "create a new"} profile.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <TabsContent value="basic" className="space-y-4 mt-0">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
                
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
                      <FormLabel>Profile Photo</FormLabel>
                      <FormControl>
                        <FileUpload
                          id="photo-upload"
                          label=""
                          accept="image/*"
                          value={photoFile || field.value}
                          onChange={handlePhotoChange}
                          previewUrl={field.value}
                          helperText="Upload a profile photo or provide a URL"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="documents" className="mt-0">
                <DocumentList 
                  documents={documents} 
                  onDocumentsChange={setDocuments} 
                />
              </TabsContent>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit">Save Profile</Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
