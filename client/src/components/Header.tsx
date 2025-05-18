import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserCircle, Menu, Settings } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import SettingsDialog from "./SettingsDialog";
import { UserPreferences, userPreferencesSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();
  
  // Load settings from localStorage
  const defaultPreferences: UserPreferences = (() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedPrefs = localStorage.getItem("profile-manager-preferences");
        if (storedPrefs) {
          return JSON.parse(storedPrefs);
        }
      }
    } catch (e) {
      console.error("Error loading preferences", e);
    }
    
    // Default preferences
    return {
      theme: "system",
      language: "en",
      cardsPerPage: 6,
      notificationsEnabled: true,
      compactView: false,
      accentColor: "#0284c7"
    };
  })();
  
  const savePreferences = (preferences: UserPreferences) => {
    // Save to localStorage for GitHub Pages compatibility
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem("profile-manager-preferences", JSON.stringify(preferences));
      }
      
      // Apply the theme immediately
      if (preferences.theme) {
        document.documentElement.setAttribute('data-theme', preferences.theme);
      }
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
      });
    } catch (e) {
      console.error("Error saving preferences", e);
      toast({
        title: "Error",
        description: "Failed to save preferences.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <header className="bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              type="button" 
              className="text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground md:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center ml-2 md:ml-0">
              <UserCircle className="text-primary h-7 w-7 mr-2" />
              <h1 className="text-xl font-semibold text-foreground">Profile Manager</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
      
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        preferences={defaultPreferences}
        onSavePreferences={savePreferences}
      />
    </header>
  );
}
